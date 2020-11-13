const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const mergeEncoded = async (
  workFolder,
  audioTracksInfo,
  videoTracksInfo,
  tracksExtraData
) => {
  try {
    const videoFolder = path.join(workFolder, `VideoTracks`);
    const videoTracks = fs.readdirSync(videoFolder);
    const audioFolder = path.join(workFolder, `EncodedAudioTracks`);
    const audioTracks = fs.readdirSync(audioFolder);
    let mkvmergeCommand = `mkvmerge --output "${workFolder}\\Encoded-audio-video.mkv" `;
    for (const track of videoTracks) {
      console.log(`Track Information :\n`, track);
      const input = path.join(videoFolder, `${track}`);
      mkvmergeCommand += `"${input}" `;
    }
    let i = 0;
    for (const track of audioTracks) {
      const input = path.join(audioFolder, `${track}`);

      const language = tracksExtraData[i].language.match(/./)
        ? tracksExtraData[i].language
        : audioTracksInfo[i].Language;
      const title = tracksExtraData[i].title.match(/./)
        ? tracksExtraData[i].title
        : audioTracksInfo[i].Title;
      mkvmergeCommand += `--language 0:"${language}" `;
      mkvmergeCommand += `--track-name 0:"${title}" `;
      mkvmergeCommand += `"${input}" `;
      i += 1;
    }

    console.log(`Merging with mkvmerge`);
    await exec(mkvmergeCommand);

    return;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { mergeEncoded };
