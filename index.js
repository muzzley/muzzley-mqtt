var mqtt = require('mqtt');
var Topic = require('./lib/topic');
var muzzleyMqtt = extend(mqtt);
muzzleyMqtt.topic = Topic;

var oldConnectFunction = muzzleyMqtt.connect;
muzzleyMqtt.connect = function(mqttOptions){
  var client = oldConnectFunction.call(this, mqttOptions);

  client.on('wrapMessage', function(message, callback){
    payload = {};
    try {
      payload = JSON.parse(message.toString());
    } catch (e) {
      console.error('Failed to parse message @ ' + topic, {message: message.toString()});
    }
    var returnMessage = {};
    if (payload.io === 'r') {
      returnMessage._cid = payload._cid;
    }
    return callback(null, returnMessage);
  });
  return client;
};


function extend (o){
  function F (){};
  F.prototype = o;
  return new F();
}

exports = module.exports = muzzleyMqtt;
