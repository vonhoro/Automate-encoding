const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jobId = crypto.randomBytes(4).toString("hex");
let counter = 0;
const { copyScreenshots, currentFolder, getOSuri } = require("./Utils.js");
const { p2pSettings } = require("./p2px264Settings");
const { testVideo } = require("./testVideo.js");
const { createScreenshots } = require("./createScreenshots.js");
const { testx264Setting } = require("./testx264Setting.js");
const { x264Test } = require("./settings.js");
const { getVideoInfo } = require("./getVideoInfo.js");
const { createScreenshotsMetadata } = require("./createScreenshotsMetadata.js");
const { jimpAnalysis } = require("./jimpAnalysis.js");
const dox264Tests = async ({
  video,
  extraOptions,
  fps,
  resolution,
  isAnime,
  isPtp,
}) => {
  try {
    let settings = isPtp ? p2pSettings : x264Test;
    const sourceFolder = path.join(currentFolder(), `job${jobId}/Source`);
    fs.mkdirSync(sourceFolder, { recursive: true });

    await createScreenshotsMetadata({
      video,
      outputFolder: sourceFolder,
      name: "Source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
      extraOptions,
    });

    //creates Screenshot to analzye from source

    await createScreenshots({
      video,
      outputFolder: sourceFolder,
      name: "Source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
      extraOptions,
    });

    const sourceSsPath = path.join(sourceFolder, `screenshots`);
    await jimpAnalysis(sourceSsPath, "Source");

    if (!isAnime && isPtp) {
      settings = settings.filter((tests) => tests.name !== "deblock");
    }
    for (const setting of settings) {
      const testFolder = path.join(
        currentFolder(),
        `job${jobId}/${setting.name}`
      );
      const sourceSsDestination = path.join(testFolder, "screenshots");
      if (!fs.existsSync(testFolder)) {
        fs.mkdirSync(sourceSsDestination, {
          recursive: true,
        });
      }
      copyScreenshots(sourceSsPath, sourceSsDestination, "Source");
      for (const test of setting.test) {
        const newData = await testVideo({
          video,
          testFolder,
          test,
          resolution,
          fps,
          extraOptions,
        });
        newVideo = newData.newVideo;
        newVideoSrc = getOSuri(newData.newVideoSrc);
        await createScreenshots({
          video: newVideoSrc,
          outputFolder: testFolder,
          name: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
          extraOptions,
        });
        await createScreenshotsMetadata({
          video: newVideoSrc,
          outputFolder: testFolder,
          name: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
          extraOptions,
        });

        await jimpAnalysis(sourceSsDestination, newVideo);
      }
    }
    console.log(
      `You can look at all the pictures, x264 logs, and alanysis of each test on job${jobId}\n`
    );
    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { dox264Tests };
