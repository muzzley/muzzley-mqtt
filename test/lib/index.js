var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var uuid = require('uuid');

var Topic = require('../../lib/topic');

lab.experiment('Testing Topic functions', function () {

  lab.test('Topic parsing - empty', function(done){
    var topic = Topic.parse();
    Code.expect(topic.message).to.equal('Empty topic');
    done();
  });

  lab.test('Topic parsing - invalid number', function(done){
    var topic = Topic.parse(10);
    Code.expect(topic.message).to.equal('Topic must be a string and not a number');
    done();
  });

  lab.test('Topic parsing - invalid short', function(done){
    var topic = Topic.parse('invalidTopic');
    Code.expect(topic.message).to.equal('Too short - Invalid topic invalidTopic');
    done();
  });

  lab.test('Topic parsing - invalid long', function(done){
    var topic = Topic.parse('a/b/c/d/e/f/g/h/k/l/m');
    Code.expect(topic.message).to.equal('Too long - Invalid topic a/b/c/d/e/f/g/h/k/l/m');
    done();
  });

  lab.test('Topic parsing - OK', function(done){
    var topic = Topic.parse('v1/iot/profiles/profX/channels/chanX/components/compX/properties/propX');
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

  lab.test('Topic stringify', function(done){
    var topicOptions = {
    }
    var topic = new Topic('v1', 'iot');
    Code.expect(topic.stringify()).to.equal('v1/iot');

    topicOptions.profiles = '#';
    var topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/#');

    topicOptions.profiles = 'profX';
    topicOptions.channels = '#';
    var topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/#');

    topicOptions.channels = 'chanX';
    topicOptions.components = '#';
    var topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/#');

    topicOptions.components = 'compX';
    topicOptions.properties = '#';
    var topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/components/compX/#');

    topicOptions.properties = 'propX';
    var topic = new Topic('v1', 'iot', topicOptions);
    Code.expect(topic.stringify()).to.equal('v1/iot/profiles/profX/channels/chanX/components/compX/properties/propX');

    done();
  });
});
