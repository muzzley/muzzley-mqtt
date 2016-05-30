'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const Topic = require('../lib/topic');

lab.experiment('Testing Topic functions', () => {
  lab.test('Topic parsing - empty', (done) => {
    const topic = Topic.parse();
    Code.expect(topic.message).to.equal('Empty topic');
    done();
  });

  lab.test('Topic parsing - invalid number', (done) => {
    const topic = Topic.parse(10);
    Code.expect(topic.message).to.equal('Topic must be a string and not a number');
    done();
  });

  lab.test('Topic parsing - invalid short', (done) => {
    const topic = Topic.parse('invalidTopic');
    Code.expect(topic.message).to.equal('Too short - Invalid topic invalidTopic');
    done();
  });

  lab.test('Topic parsing - invalid long', (done) => {
    const topic = Topic.parse('a/b/c/d/e/f/g/h/k/l/m');
    Code.expect(topic.message).to.equal('Too long - Invalid topic a/b/c/d/e/f/g/h/k/l/m');
    done();
  });

  lab.test('Topic parsing - OK', (done) => {
    let topic = Topic.parse('v1/iot/profiles/profX/channels/chanX/components/compX/properties/propX');
    Code.expect(topic.version).to.equal('v1');
    Code.expect(topic.namespace).to.equal('iot');
    Code.expect(topic.profiles).to.equal('profX');
    Code.expect(topic.channels).to.equal('chanX');
    Code.expect(topic.components).to.equal('compX');
    Code.expect(topic.properties).to.equal('propX');

    topic = Topic.parse('v1/iot/profiles/profX/channels/#');
    Code.expect(topic.version).to.equal('v1');
    Code.expect(topic.namespace).to.equal('iot');
    Code.expect(topic.profiles).to.equal('profX');
    Code.expect(topic.channels).to.equal('#');
    Code.expect(topic.components).to.be.undefined();
    Code.expect(topic.properties).to.be.undefined();

    topic = Topic.parse('v1/iot/#');
    Code.expect(topic.version).to.equal('v1');
    Code.expect(topic.namespace).to.equal('iot');
    Code.expect(topic.profiles).to.equal('#');
    Code.expect(topic.channels).to.be.undefined();
    Code.expect(topic.components).to.be.undefined();
    Code.expect(topic.properties).to.be.undefined();
    done();
  });

  lab.test('Topic stringify', (done) => {
    let topicOptions = {};
    let topic = new Topic('v1', 'iot');
    Code.expect(topic.stringify()).to.equal('v1/iot');

    topicOptions.profiles = '#';
    topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/#');

    topicOptions.profiles = 'profX';
    topicOptions.channels = '#';
    topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/#');

    topicOptions.channels = 'chanX';
    topicOptions.components = '#';
    topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/#');

    topicOptions.components = 'compX';
    topicOptions.properties = '#';
    topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/components/compX/#');

    topicOptions.properties = 'propX';
    topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/components/compX/properties/propX');

    done();
  });
});
