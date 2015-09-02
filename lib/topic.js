var path = require('path');
function Topic (version, namespace, options) {
  options = options || {};
  this.version = version;
  this.namespace = namespace;
  this.profiles = options.profiles;
  this.channels = options.channels;
  this.components = options.components;
  this.properties = options.properties;
}

Topic.parse = function (topic) {
  var self = this;
  var topicProps = topic.split('/');
  var result = Object.create(self.prototype);
  if (topicProps.length < 4) {
    throw new Error('Invalid topic ' + topic);
  }
  result.version = topicProps[0];
  result.namespace = topicProps[1];
  for (var i = 2; i < topicProps.length; i += 2) {
    if (topicProps[i] === '#') {
      result[self._getProp(i)] = '#';
    } else {
      result[self._getProp(i)] = topicProps[i + 1];
    }
  }
  return result;
};

Topic._getProp = function (n) {
  switch (n) {
    case 2:
      return 'profiles';
    case 4:
      return 'channels';
    case 6:
      return 'components';
    case 8:
      return 'properties';
    default:
      throw new Error('Invalid property number ' + n);
  }
};

Topic.prototype.stringify = function () {
  var profiles = this.profiles === '#' ? false : (this.profiles && 'profiles');
  var channels = this.channels === '#' ? false : (this.channels && 'channels');
  var components = this.components === '#' ? false : (this.components && 'components');
  var properties = this.properties === '#' ? false : (this.properties && 'properties');

  return path.join(
    this.version,
    this.namespace,
    profiles || '',
    this.profiles || '',
    channels || '',
    this.channels || '',
    components || '',
    this.components || '',
    properties || '',
    this.properties || ''
  );
};

exports = module.exports = Topic;