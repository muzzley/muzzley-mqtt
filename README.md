# Muzzley MQTT Wrapper

This module wraps around the [mqtt](https://www.npmjs.com/package/mqtt) module and provides further functionality, namely:
- Topic parsing
- Correlation ID Auto-Fill

### Install
Not yet available on npm, clone this repository to use this wrapper.

### Run Tests
Just run `npm test` (100% coverage)

### Usage
```js
var muzzleyMqtt = require('muzzley-mqtt');
var mqttOptions = {/*just like the mqtt api*/};
var topicOptions = {
  version: 'v1',
  namespace: 'iot',
  options: {
    profiles: 'appProfile',
    channels: 'yourChannel', //or # for all channels
    components: 'yourComponent'
    properties: 'yourProperty'
  }
};
var client = muzzleyMqtt.connect(mqttOptions);

client.on('connect', function () {
  //creat a topic with options
  var topic = new muzzleyMqtt.topic(topicOptions.version, topicOptions.namespace, topicOptions.options);
  //stringify it to subscribe
  client.subscribe(topic.stringify(), function(err, granted){
    //Handle subscription
  });
};

client.on('message', function(topic, OldMessage){
  //process the topic
  var parsedTopic = Topic.parse(topic);
  //process and create a return message (add custom logic)
  var returnMessage = {};

  client.emit('wrapMessage', oldMessage, returnMessage, function(err, wrappedMessage){
      //If the message is a read, wrappedMessage will have the _cid already set
      //Also the message will be an 'i' message
      //Now you only need to deal with the error (if any) and stringify the message for publishing
      if (err) {
        console.log(err);
      } else {
        client.publish(topic, JSON.stringify(wrappedMessage));
      }
  });
});

```
