const util = require("util");
const exec = util.promisify(require("child_process").exec);
const readline = require("readline");
const path = require("path");
const fs = require("fs");

const encodeAudio = async (workFolder, audioTracks, bitrate, jobId) => {
  try {
    fs.mkdirSync(`audio-encode/${jobId}/EncodedAudioTracks`);
    const srcFolder = `${workFolder}AudioTracks/`;
    for (const track of audioTracks) {
      const input = path.join(
        workFolder,
        `AudioTracks/track-${track.ID}.${track.Format}`
      );
      const output = path.join(
        workFolder,
        `EncodedAudioTracks/track-${track.ID}`
      );
      if (track.Title.match(/commentary/i)) {
        console.log("Encoding Commentary");
        await exec(
          `ffmpeg -i "${input}" -ab 80000 -acodec aac "${output}-Commentary.AAC"`
        );
      } else {
        if (track.Compression_Mode.match(/Lossy/i)) {
          fs.copyFileSync(input, `${output}.${track.Format}`);
        } else {
          if (track.Channels.match(/1|2/)) {
            if (parseInt(track.BitRate) < 640001) {
              console.log("Encoding to .flac");
              await exec(`ffmpeg -i "${input}" -acodec flac "${output}.FLAC"`);
            }
            console.log("Encoding to .aac");
            const audioBitRate = bitrate > 500000 ? 320000 : 240000;
            await exec(
              `ffmpeg -i "${input}" -ab ${audioBitRate} -acodec aac "${output}.AAC"`
            );
          } else if (track.Channels.match(/8|6/)) {
            console.log("Encoding to AC3");
            await exec(
              `ffmpeg -i "${input}" -acodec ac3 -ab ${bitrate} "${output}.AC3"`
            );
          }

          console.log("Audio track encoded");
        }
      }
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { encodeAudio };
