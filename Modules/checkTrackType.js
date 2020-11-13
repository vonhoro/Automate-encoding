const isAudioTrack = (track) => {
  const trackType = Object.values(track)[0];
  if (trackType.match(/Audio/)) return true;
  return false;
};

const isVideoTrack = (track) => {
  const trackType = Object.values(track)[0];
  if (trackType.match(/Video/)) return true;
  return false;
};

module.exports = { isAudioTrack, isVideoTrack };
