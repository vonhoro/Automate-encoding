const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const process = require("process");

const numberOfScreenhots = 10;

currentFolder = process.cwd();
let counter = 1;
// Modules
const { getVideoInfo } = require("./Modules/getVideoInfo.js");
const { createScreenshots } = require("./Modules/createScreenshots.js");
const { getOSuri, randomFrameDistribution } = require("./Modules/utils.js");

const {
  cropVertically,
  cropHorizontally,
} = require("./Modules/cropFunction.js");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Put source video link \n Example:C:\\Users\\Admin\\Videos\\myvideo.mp4\n",
  async (videoSrc) => {
    const video = getOSuri(videoSrc);
    await previewingScreenShots(video);

    rl.close();
  }
);
async function previewingScreenShots(video) {
  try {
    const { numberOfFrames } = await getVideoInfo(video);

    const positions = randomFrameDistribution(
      numberOfFrames,
      numberOfScreenhots
    );
    await createScreenshots({
      video,
      jobId: "Crop preview",
      folder: `Take number - ${counter}`,
      test: "crop",
      positions,
    });
    const folder = path.join(
      currentFolder,
      `jobCrop preview/Take number - ${counter}`
    );

    const { removeTop, removeBottom } = await cropVertically(folder, "crop");
    const { removeRight, removeLeft } = await cropHorizontally(folder, "crop");

    console.log(
      `the recomended crop setting is\n clip = core.std.Crop(clip, left=${removeLeft}, right=${removeRight},top = ${removeTop},bottom = ${removeBottom})`
    );
    const extraOptions = `clip = core.std.Crop(clip, left=${removeLeft}, right=${removeRight},top = ${removeTop},bottom = ${removeBottom})`;

    await createScreenshots({
      video,
      jobId: "Crop preview",
      folder: `Take number - ${counter}`,
      test: "Cropped",
      positions,
      extraOptions,
    });
    console.log(
      `You can see all screenshots at jobCrop preview/Take number - ${counter} with the suggested options`
    );
    return;
  } catch (err) {
    console.log(err);
  }
}
