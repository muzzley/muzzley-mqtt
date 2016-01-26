var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var muzzleyMqtt = require('../index');
var uuid = require('uuid');

lab.experiment('Testing MQTT wrapper', function () {
  lab.test('connection', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    client.on('connect', function () {
      Code.expect(true).to.be.true();
      done();
    });
  });

  lab.test('subscription', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    var subscriptionTopic = uuid.v1();
    client.on('connect', function () {
      client.subscribe(subscriptionTopic, function (err, granted) {
        Code.expect(err).to.be.null();
        Code.expect(granted).to.be.array();
        done();
      });
    });
  });

  lab.test('publishing', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    var subscriptionTopic = uuid.v1();
    client.on('connect', function () {
      client.subscribe(subscriptionTopic, function (err, granted) {
        client.publish(subscriptionTopic, 'Hello, World!');
      });
    });

    client.on('message', function (topic, message) {
      Code.expect(topic).to.equal(subscriptionTopic);
      Code.expect(message.toString()).to.equal('Hello, World!');
      done();
    });
  });

  lab.test('message wrapping - String', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      io: 'r'
    };
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', JSON.stringify(oldMessage), JSON.stringify(newMessage), function (err, emittedMessage) {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Object', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      io: 'w'
    };
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, function (err, emittedMessage) {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Buffer', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      io: 'w'
    };
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', new Buffer(JSON.stringify(oldMessage)), new Buffer(JSON.stringify(newMessage)), function (err, emittedMessage) {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - RPC', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      io: 'r',
      _cid: 'random cid number'
    };
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, function (err, emittedMessage) {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage._cid).to.equal('random cid number');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Invalid format', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      oi: 'r'
    };
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, function (err, emittedMessage) {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Invalid message format');
      done();
    });
  });

  lab.test('message wrapping - Unsupported type oldMessage', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', 42, newMessage, function (err, emittedMessage) {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Unsupported message type: number');
      done();
    });
  });

  lab.test('message wrapping - Unsupported type newMessage', function (done) {
    var client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    var oldMessage = {
      oi: 'r'
    };
    client.emit('wrapMessage', oldMessage, 42, function (err, emittedMessage) {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Unsupported message type: number');
      done();
    });
  });
});
