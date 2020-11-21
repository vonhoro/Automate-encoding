const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const process = require("process");
const currentFolder = process.cwd();

//Modules

const { getOSuri, renameScreenshots } = require("./utils.js");
const createScreenshots = async ({
  extraOptions,
  video,
  outputFolder,
  name,
  positions,
  resolutions,
}) => {
  try {
    const screenshotOutputFolder = path.join(outputFolder, `screenshots`);
    if (!fs.existsSync(screenshotOutputFolder)) {
      fs.mkdirSync(screenshotOutputFolder);
    }
    let output = path.join(screenshotOutputFolder, `-frame-${name}-%d.png`);
    output = getOSuri(output);

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
screenshots = core.imwri.Write(frames,imgformat="PNG",filename=(${output}),firstnum=1, overwrite=True)
screenshots.set_output()
 `;

    fs.writeFileSync("screenshots.py", screenShotsToAnalyze);
    await exec(`bin\\vspipe screenshots.py .`);
    fs.unlinkSync("screenshots.py");

    renameScreenshots(screenshotOutputFolder, name, positions, false);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createScreenshots };
