const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { isVideoTrack, isAudioTrack } = require("./checkTrackType.js");
const getTracksInfo = async (media) => {
  try {
    const { stdout, stderr } = await exec(`mediainfo --Output=JSON "${media}"`);
    const tracks = JSON.parse(stdout).media.track;
    let audioTracks = [];
    let videoTracks = [];
    for (const track of tracks) {
      if (isAudioTrack(track)) {
        audioTracks = [...audioTracks, track];
      }
      if (isVideoTrack(track)) {
        videoTracks = [...videoTracks, track];
      }
    }
    if(videoTracks) {
    const srcHeight = videoTracks[0].Height;
    }
    return { videoTracks, audioTracks, srcHeight };
  } catch (error) {
    console.log(error);
  }
};
module.exports = { getTracksInfo };
// getTracksInfo(
// "C:\\Users\\Dan\\dleete later\\[bushido] Bakemonogatari 06 (1920x1080 BD HEVC AAC) [2158E608].mkv"
// );
// getTracksInfo(
// "C:\\Users\\Dan\\dleete later\\[bushido] Bakemonogatari 04 (1920x1080 BD HEVC AAC) [E7A17C7F].mkv"
// );
// getTracksInfo(
// "C:\\Users\\Dan\\dleete later\\[bushido] Bakemonogatari 05 (1920x1080 BD HEVC AAC) [DDA62160].mkv"
// );
// getTracksInfo(
// "C:\\Users\\Dan\\dleete later\\[bushido] Bakemonogatari 02 (1920x1080 BD HEVC AAC) [FB715946].mkv"
// );
// getTracksInfo(
// "C:\\Users\\Dan\\dleete later\\[bushido] Bakemonogatari 03 (1920x1080 BD HEVC AAC) [BA4D9354].mkv"
// );
