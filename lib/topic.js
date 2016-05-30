'use strict';

const path = require('path');

function Topic (version, namespace, options) {
  options = options || {};
  const profiles = options.profiles;
  const channels = options.channels;
  const components = options.components;
  const properties = options.properties;

  function stringify () {
    const hasProfiles = profiles === '#' ? false : (profiles && 'profiles');
    const hasChannels = channels === '#' ? false : (channels && 'channels');
    const hasComponents = components === '#' ? false : (components && 'components');
    const hasProperties = properties === '#' ? false : (properties && 'properties');

    return path.join(
      version,
      namespace,
      hasProfiles || '',
      profiles || '',
      hasChannels || '',
      channels || '',
      hasComponents || '',
      components || '',
      hasProperties || '',
      properties || ''
    );
  }

  return {
    stringify,
    version,
    namespace,
    profiles,
    channels,
    components,
    properties
  };
}

Topic.parse = function (topic) {
  function getProp (n) {
    switch (n) {
      case 2:
        return 'profiles';
      case 4:
        return 'channels';
      case 6:
        return 'components';
      case 8:
        return 'properties';
    }
  }

  if (!topic) {
    return new Error('Empty topic');
  }
  if (typeof topic !== 'string') {
    return new Error('Topic must be a string and not a ' + typeof topic);
  }
  const topicProps = topic.split('/');
  if (topicProps.length < 3) {
    return new Error('Too short - Invalid topic ' + topic);
  }
  if (topicProps.length > 10) {
    return new Error('Too long - Invalid topic ' + topic);
  }
  let options = {};
  for (var i = 2; i < topicProps.length; i += 2) {
    if (topicProps[i] === '#') {
      options[getProp(i)] = '#';
    } else {
      options[getProp(i)] = topicProps[i + 1];
    }
  }
  return Topic(topicProps[0], topicProps[1], options);
};

module.exports = Topic;
