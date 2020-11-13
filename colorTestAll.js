const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const readline = require("readline");
const process = require("process");
let counter = 0;
const crypto = require("crypto");
const currentFolder = process.cwd();
const jobId = crypto.randomBytes(4).toString("hex");

const firstx264Test = `x264 --demuxer y4m  --level 4.1 --no-mbtree --no-dct-decimate --preset veryslow --no-fast-pskip --keyint 240 --colormatrix bt709 --vbv-maxrate 50000 --vbv-bufsize 62500 --merange 32 --bframes 10 --deblock -3,-3 --qcomp 0.62 --aq-mode 3 --aq-strength 0.8 --psy-rd 1.1 --pass 1 --bitrate 8000 --output job${jobId}/ip-ratio/noip1.mkv -`;
const { jimpAnalysis } = require("./Modules/jimpAnalysis.js");
const { x264Test } = require("./Modules/settings.js");
const { createScreenshots } = require("./Modules/createScreenshots.js");
const {
  createScreenshotsMetadata,
} = require("./Modules/createScreenshotsMetadata.js");

const { getOSRUI, copyScreenshots } = require("./Modules/utils.js");

const { testx264Setting } = require("./Modules/testx264Setting.js");
const { testVideo } = require("./Modules/testVideo.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//ask for video input

rl.question(
  "Put source video link \n Example:C:\\Users\\Admin\\Videos\\myvideo.mp4\n\n",
  async (videoSrc) => {
    //runs preview

    const sourceFileName = path.win32.basename(videoSrc);
    const video = getOSRUI(videoSrc);
    await previewingScreenShots("preview.py", video, sourceFileName);
    rl.close();
  }
);

async function previewingScreenShots(script, video, fileName) {
  try {
    console.log(`Current Job is job${jobId}\n`);

    if (!fs.existsSync(`job${jobId}`)) {
      fs.mkdirSync(`job${jobId}`);
    }
    if (!fs.existsSync(`job${jobId}/source`)) {
      fs.mkdirSync(`job${jobId}/source`);
    }

    await createScreenshotsMetadata({
      video,
      jobId,
      folder: "source",
      test: "source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
      resolutions: [1080],
    });

    //creates Screenshot to analzye from source

    await createScreenshots({
      video,
      jobId,
      folder: "source",
      test: "source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
    });
    if (!fs.existsSync(`job${jobId}/ip-ratio`)) {
      fs.mkdirSync(`job${jobId}/ip-ratio`);
    }
    if (!fs.existsSync(`job${jobId}/ip-ratio/screenshots`)) {
      fs.mkdirSync(`job${jobId}/ip-ratio/screenshots`);
    }

    const sourceSsPath = path.join(
      currentFolder,
      `job${jobId}/source/screenshots`
    );
    const sourceSsDestination = path.join(
      currentFolder,
      `job${jobId}/ip-ratio/screenshots`
    );
    copyScreenshots(sourceSsPath, sourceSsDestination, "source");

    // analyze the screen shots from source

    await jimpAnalysis(sourceSsPath, "source");

    await testx264Setting(video, jobId, firstx264Test, "noip1", "ip-ratio");

    let newVideo = firstx264Test
      .split(" ")
      .filter((setting) => setting.match(/.mkv$/))[0];
    let newVideoSrc = path.join(currentFolder, newVideo);
    newVideoSrc = getOSRUI(newVideoSrc);
    newVideo = "noip1";
    for (const setting of x264Test) {
      let oldFolder;

      for (const test of setting.test) {
        if (!fs.existsSync(`job${jobId}/${setting.name}`)) {
          fs.mkdirSync(`job${jobId}/${setting.name}`);
          fs.mkdirSync(`job${jobId}/${setting.name}/screenshots`);
          const sourceSsDestination = path.join(
            currentFolder,
            `job${jobId}/${setting.name}/screenshots`
          );
          copyScreenshots(sourceSsPath, sourceSsDestination, "source");
          oldFolder = x264Test[counter - 1].name;
        } else {
          oldFolder = setting.name;
        }
        await createScreenshots({
          video: newVideoSrc,
          jobId,
          folder: oldFolder,
          test: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
        });
        await createScreenshotsMetadata({
          video: newVideoSrc,
          jobId,
          folder: oldFolder,
          test: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
          resolutions: [1080],
        });

        const ssPath = path.join(
          currentFolder,
          `job${jobId}/${oldFolder}/screenshots`
        );
        await jimpAnalysis(ssPath, newVideo);
        const newData = await testVideo(
          currentFolder,
          video,
          jobId,
          test,
          setting.name
        );
        newVideo = newData.newVideo;
        newVideoSrc = getOSRUI(newData.newVideoSrc);
      }
      counter += 1;
    }

    return;
  } catch (error) {
    console.log(error);
  }
}
