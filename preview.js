const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const readline = require("readline");
const fs = require("fs");

// Modules

const {
  createScreenshotsMetadata,
} = require("./Modules/createScreenshotsMetadata.js");
const { createClips } = require("./Modules/createClips.js");
const { getVideoInfo } = require("./Modules/getVideoInfo.js");

const { getOSuri, randomFrameDistribution } = require("./Modules/utils.js");

//Global controller

let counter = 0;

const numberOfScreenShots = 8;
// Creating readLine interface to to get information from CLI

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Put source video link \n Example:C:\\Users\\Admin\\Videos\\myvideo.mp4\n\n",
  async (videoSrc) => {
    //runs preview
    const video = getOSuri(videoSrc);
    await previewingScreenShots(video);
  }
);

async function previewingScreenShots(video) {
  //Get information about the video
  try {
    const { numberOfFrames } = await getVideoInfo(video);

    const positions = randomFrameDistribution(
      numberOfFrames,
      numberOfScreenShots
    );
    await createScreenshotsMetadata({
      video,
      resolutions: [480, 576, 720, 1080],
      positions,
    });
    await rl.question(
      "\nYou can see the Screenshots of each resolution on its repective folder,\n If you want another take send [R] or [r], if you want to create short clips press [C] or [c] \n If you want to exit send another letter or just press enter\n\n",
      async (answer) => {
        //checks the input

        if (answer.match(/^c$/i)) {
          await createClips(video, [480, 576, 720, 1080]);

          console.log(
            "You can see the clips and their logs at the clips folder\n good Bye"
          );
          rl.close();
        } else if (answer.match(/^r$/i)) {
          previewingScreenShots(video, [480, 576, 720, 1080]);
        } else {
          console.log("Good bye");
          rl.close();
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
}
