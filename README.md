# Muzzley MQTT Wrapper

This module wraps around the <a href='https://www.npmjs.com/package/mqtt'>mqtt</a> module and provides further functionality, namely:
<ul>
  <li>Topic parsing</li>
  <li>Auto-Fill correlation id</li>
</ul>

### Install
Not yet available on npm, clone this repository to use this wrapper.

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
  var topic = new muzzleyMqtt.topic(topicOptions.version, topicOptions.namespace, topicOptions.options);
  client.subscribe(topic.stringify(), function(err, granted){
    //Handle subscription
  });
};

client.on('message', function(topic, message){
  client.emit('wrapMessage', message, function(err, wrappedMessage){
      //If the message is a read, wrappedMessage will have the _cid already set
      //Now you only need to handle all the other message properties (namely io and data)

      //After processing the message if you want you can then perform a publish on the topic
      client.publish(topic, JSON.stringify(wrappedMessage));
  });
});

```
