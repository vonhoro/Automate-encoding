const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jobId = crypto.randomBytes(4).toString("hex");
let counter = 0;
const { copyScreenshots, currentFolder, getOSuri } = require("./Utils.js");
const { p2pSettings } = require("./p2px264Settings");
const { testVideo } = require("./testVideo.js");
const { createScreenshots } = require("./createScreenshots.js");
const { x264Test } = require("./settings.js");
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
    extraOptions = extraOptions === undefined ? "" : extraOptions;
    const extractOptions = `
${extraOptions}
nframes = clip.num_frames
numberSS = 7
offset = round(nframes*.15)
cycle =round(nframes*.7/(numberSS)) 
clip = core.std.Trim(clip, first=offset, last=clip.num_frames-offset)
clip = core.std.SelectEvery(clip, cycle, offsets=range(60))
clip = core.std.AssumeFPS(clip, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
`;
    await createScreenshotsMetadata({
      video,
      outputFolder: sourceFolder,
      name: "Source",
      positions: [30, 90, 150, 210, 270, 330, 390],
      extraOptions: extractOptions,
    });

    //creates Screenshot to analzye from source

    await createScreenshots({
      video,
      outputFolder: sourceFolder,
      name: "Source",
      positions: [30, 90, 150, 210, 270, 330, 390],
      extraOptions: extractOptions,
    });

    const sourceSsPath = path.join(sourceFolder, `screenshots`);
    await jimpAnalysis(sourceSsPath, "Source");

    if (!isAnime && isPtp) {
      settings = settings.filter((tests) => tests.name !== "deblock");
    } else if (isAnime && isPtp) {
      let modifiedSettings = [];
      for (const setting of settings) {
        let newSettingTest = [];
        if (!setting.name.match(/aq-mode/)) {
          let newSettingName = setting.name;

          for (const test of setting.test) {
            newSettingTest = [
              ...newSettingTest,
              test.replace(test, `${test} --aq-mode 2`),
            ];
          }

          modifiedSettings = [
            ...modifiedSettings,
            { name: newSettingName, test: newSettingTest },
          ];
        }
      }

      settings = modifiedSettings;
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
