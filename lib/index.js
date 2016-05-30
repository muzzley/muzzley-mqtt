'use strict';

const mqtt = require('mqtt');
const Topic = require('./topic');
const Joi = require('joi');
const async = require('async');

const muzzleyMqtt = Object.assign({}, mqtt);
muzzleyMqtt.Topic = Topic;

const oldConnectFunction = muzzleyMqtt.connect;
muzzleyMqtt.connect = function (mqttOptions) {
  const client = oldConnectFunction.call(this, mqttOptions);

  client.on('wrapMessage', (oldMessage, newMessage, callback) => {
    async.parallel([
      async.apply(parse, oldMessage),
      async.apply(parse, newMessage)
    ], (err, messages) => {
      if (err) {
        return callback(err);
      }
      oldMessage = messages[0];
      newMessage = messages[1];
      const messageSchema = {
        io: Joi.string().valid('w', 'r', 'i').required(),
        _cid: Joi.string(),
        u: Joi.object().keys({
          id: Joi.any(),
          name: Joi.any()
        }),
        data: Joi.object()
      };

      Joi.validate(oldMessage, messageSchema, (err) => {
        if (err) {
          return callback(err);
        }
        newMessage.io = 'i';
        if (oldMessage.io === 'r') {
          newMessage._cid = oldMessage._cid;
        }
        return callback(null, newMessage);
      });
    });
  });
  return client;
};

function parseGenerator (parseType) {
  return function (message, callback) {
    if (parseType === 'buffer') {
      message = message.toString();
    }
    try {
      message = parseType === 'object' ? message : JSON.parse(message);
    } catch (err) {
      return callback(err);
    }
    return callback(null, message);
  };
}

function parse (message, callback) {
  let parseGeneratorInstance;
  if (typeof message === 'string') {
    parseGeneratorInstance = parseGenerator();
  } else if (message instanceof Buffer) {
    parseGeneratorInstance = parseGenerator('buffer');
  } else if (message instanceof Object) {
    parseGeneratorInstance = parseGenerator('object');
  }
  if (!parseGeneratorInstance) {
    return callback(new Error('Unsupported message type: ' + typeof message));
  }
  return parseGeneratorInstance(message, callback);
}

module.exports = muzzleyMqtt;
