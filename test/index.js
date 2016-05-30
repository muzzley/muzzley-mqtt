'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const muzzleyMqtt = require('../index');
const uuid = require('uuid');

lab.experiment('Testing MQTT wrapper', () => {
  lab.test('connection', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    client.on('connect', () => {
      Code.expect(true).to.be.true();
      done();
    });
  });

  lab.test('subscription', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    const subscriptionTopic = uuid.v1();
    client.on('connect', () => {
      client.subscribe(subscriptionTopic, (err, granted) => {
        Code.expect(err).to.be.null();
        Code.expect(granted).to.be.array();
        done();
      });
    });
  });

  lab.test('publishing', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');

    const subscriptionTopic = uuid.v1();
    client.on('connect', () => {
      client.subscribe(subscriptionTopic, (err, granted) => {
        Code.expect(err).to.be.null();
        client.publish(subscriptionTopic, 'Hello, World!');
      });
    });

    client.on('message', (topic, message) => {
      Code.expect(topic).to.equal(subscriptionTopic);
      Code.expect(message.toString()).to.equal('Hello, World!');
      done();
    });
  });

  lab.test('message wrapping - String', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      io: 'r'
    };
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', JSON.stringify(oldMessage), JSON.stringify(newMessage), (err, emittedMessage) => {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Object', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      io: 'w'
    };
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, (err, emittedMessage) => {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Buffer', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      io: 'w'
    };
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', new Buffer(JSON.stringify(oldMessage)), new Buffer(JSON.stringify(newMessage)), (err, emittedMessage) => {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - RPC', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      io: 'r',
      _cid: 'random cid number'
    };
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, (err, emittedMessage) => {
      Code.expect(err).to.be.null();
      Code.expect(emittedMessage.io).to.equal('i');
      Code.expect(emittedMessage._cid).to.equal('random cid number');
      Code.expect(emittedMessage.data.value).to.equal('random data value');
      done();
    });
  });

  lab.test('message wrapping - Invalid format', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      oi: 'r'
    };
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', oldMessage, newMessage, (err, emittedMessage) => {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('child "io" fails because ["io" is required]');
      done();
    });
  });

  lab.test('message wrapping - Unsupported type oldMessage', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const newMessage = {
      data: {
        value: 'random data value'
      }
    };
    client.emit('wrapMessage', 42, newMessage, (err, emittedMessage) => {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Unsupported message type: number');
      done();
    });
  });

  lab.test('message wrapping - Unsupported type newMessage', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      oi: 'r'
    };
    client.emit('wrapMessage', oldMessage, 42, (err, emittedMessage) => {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Unsupported message type: number');
      done();
    });
  });

  lab.test('message wrapping - parse exception', (done) => {
    const client = muzzleyMqtt.connect('mqtt://test.mosquitto.org');
    const oldMessage = {
      oi: 'r'
    };
    client.emit('wrapMessage', oldMessage, '{42', (err, emittedMessage) => {
      Code.expect(err).not.to.be.null();
      Code.expect(err.message).to.equal('Unexpected number');
      done();
    });
  });
});
