const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const process = require("process");
const currentFolder = process.cwd();
//Modules

const { renameScreenshots } = require("./utils.js");
const createScreenshots = async ({
  video,
  jobId,
  folder,
  test,
  positions,
  resolutions,
  extraOptions,
}) => {
  try {
    if (!fs.existsSync(`job${jobId}`)) {
      fs.mkdirSync(`./job${jobId}`);
    }
    if (!fs.existsSync(`./job${jobId}/${folder}`)) {
      fs.mkdirSync(`./job${jobId}/${folder}`);
    }
    if (!fs.existsSync(`job${jobId}/${folder}/screenshots`)) {
      fs.mkdirSync(`job${jobId}/${folder}/screenshots`);
    }
    const extraSettings = extraOptions ? extraOptions : "";

    let screenshotsToTake = "";
    let screenshotsCombined = "frames =";
    for (let i = 0; i < positions.length; i += 1) {
      screenshotsToTake += `ss${i + 1} = clip[${positions[i]}]\n`;
      screenshotsCombined += ` ss${i + 1} +`;
    }
    screenshotsCombined = screenshotsCombined.slice(0, -1);
    const screenShotsToAnalyze = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
clip = core.resize.Bicubic(clip, format=vs.RGB24, matrix_in_s="709")
${extraSettings}
${screenshotsToTake}
${screenshotsCombined}
screenshots = core.imwri.Write(frames,imgformat="PNG",filename="job${jobId}/${folder}/screenshots/${test}-frame-%d.png",firstnum=1, overwrite=True)
screenshots.set_output()
 `;

    fs.writeFileSync("screenshots.py", screenShotsToAnalyze);
    await exec(`vspipe screenshots.py .`);
    fs.unlinkSync("screenshots.py");
    const Folder = path.join(
      currentFolder,
      `job${jobId}/${folder}/screenshots`
    );
    renameScreenshots(Folder, test, positions, false);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createScreenshots };
