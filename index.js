var mqtt = require('mqtt');
var Topic = require('./lib/topic');
var Joi = require('joi');
var muzzleyMqtt = extend(mqtt);
muzzleyMqtt.topic = Topic;

var messageSchema = {
    io: Joi.string().valid('w', 'r', 'i').required(),
    _cid: Joi.string(),
    u: Joi.object().keys({
      id: Joi.any(),
      name: Joi.string()
    }),
    data: Joi.object()
};

var oldConnectFunction = muzzleyMqtt.connect;
muzzleyMqtt.connect = function(mqttOptions){
  var client = oldConnectFunction.call(this, mqttOptions);

  client.on('wrapMessage', function(oldMessage, newMessage, callback){
    oldMessage = parse(oldMessage);
    if(oldMessage instanceof Error){
      return callback(oldMessage);
    }
    newMessage = parse(newMessage);
    if(newMessage instanceof Error){
      return callback(newMessage);
    }
    var validOldMessage = Joi.validate(oldMessage, messageSchema);
    if(validOldMessage.error){
      return callback(new Error('Invalid message format'));
    }

    newMessage.io = 'i';
    if (oldMessage.io === 'r') {
      newMessage._cid = oldMessage._cid;
    }
    return callback(null, newMessage);
  });

  return client;
};

function parse(message){
  if (typeof message === 'string') {
    return JSON.parse(message);
  }
  if (message instanceof Buffer) {
    return JSON.parse(message.toString());
  }
  if (message instanceof Object) {
    return message;
  }
  return new Error('Unsupported message type: ' + typeof message);
}


function extend (o){
  function F (){};
  F.prototype = o;
  return new F();
}

exports = module.exports = muzzleyMqtt;
