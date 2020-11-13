const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");
const jobId = crypto.randomBytes(4).toString("hex");
const currentFolder = process.cwd();
const { encodeAudio } = require("./Modules/encodeAudio.js");
const { getTracksInfo } = require("./Modules/getTracksInfo.js");
const { extractTracks } = require("./Modules/extractTracks.js");
const { mergeEncoded } = require("./Modules/mergeEncoded.js");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log(
  "Input videosrc to separate tracks and encode their audio! (only .mkv files)\n Example:C:\\Users\\Admin\\Videos\\mykvide.mkv"
);
const askingTitle = () => {
  return new Promise((resolve, reject) =>
    rl.question(
      "Enter Title of the track, if you dont input anything it will have the same\n",
      async (title) => {
        resolve(title);
      }
    )
  );
};
const askingLanguage = () => {
  return new Promise((resolve, reject) =>
    rl.question(
      "Enter language of the track, if you dont input anything it will have the sam\n",
      async (language) => {
        resolve(language);
      }
    )
  );
};

let lineControl = [];
rl.on("line", async (line) => {
  try {
    lineControl = [...lineControl, line];
    if (lineControl.length === 1) {
      console.log(`Job ID: ${jobId}`);
      const videoSrc = lineControl[0];
      const workFolder = path.join(currentFolder, `audio-encode/${jobId}`);
      const fileName = path.win32.basename(videoSrc);
      const { videoTracks, audioTracks, srcHeight } = await getTracksInfo(
        videoSrc
      );
      await extractTracks(videoTracks, videoSrc, "Video", workFolder);
      await extractTracks(audioTracks, videoSrc, "Audio", workFolder);
      const bitRates =
        srcHeight.match(/720/) || srcHeight.match(/1080/) ? 640000 : 448000;
      console.log("Encoding audio");
      await encodeAudio(workFolder, audioTracks, bitRates, jobId);
      console.log("All audio had been encoded");
      let tracksExtraData = [];
      for (const track of audioTracks) {
        console.log("Original Track Info\n", track);
        const title = await askingTitle();
        const language = await askingLanguage();
        tracksExtraData = [...tracksExtraData, { title, language }];
      }

      console.log("Merging encoded audio to Video track");

      await mergeEncoded(workFolder, audioTracks, videoTracks, tracksExtraData);
      console.log("Job Completed");

      rl.close();
    }
  } catch (error) {
    console.log(error);
  }
});
