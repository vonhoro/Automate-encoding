const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const process = require("process");
const currentFolder = process.cwd();

const { getOSuri, renameScreenshots } = require("./utils.js");
const createScreenshotsMetadata = async ({
  extraOptions,
  video,
  outputFolder,
  name,
  positions,
  resolutions,
}) => {
  try {
    //Get information about the video
    const extraSettings = extraOptions ? extraOptions : "";
    const fileName = path.win32.basename(video).match(/"$/)
      ? path.win32.basename(video).replace(/"$/, "")
      : path.win32.basename(video);

    let screenshotsToTake = "";
    let screenshotsCombined = "frames =";
    for (let i = 0; i < positions.length; i += 1) {
      screenshotsToTake += `ss${i + 1} = clip[${positions[i]}]
ss${i + 1} = core.text.Text(ss${i + 1},"\\nFrame ${
        positions[i]
      } of " + str(clip.num_frames),alignment=8)
ss${i + 1} = core.text.ClipInfo(ss${i + 1}, alignment=7)
`;
      screenshotsCombined += ` ss${i + 1} +`;
    }
    screenshotsCombined = screenshotsCombined.slice(0, -1);
    let pythonScreenShotsScript;

    if (resolutions) {
      for (const resolution of resolutions) {
        if (!fs.existsSync(resolution.toString())) {
          fs.mkdirSync(resolution.toString());
        }
        pythonScreenShotsScript = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
${extraSettings}
clip = core.resize.Bicubic(clip, format=vs.RGB24, matrix_in_s="709")
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
clip = core.text.Text(clip,"${fileName}", alignment=8)
${screenshotsToTake}
${screenshotsCombined}
screenshots = core.imwri.Write(frames,imgformat="PNG",filename="/${resolution}/pictpreview%d.png",firstnum=1, overwrite=True)
screenshots.set_output()
`;
      }
    } else {
      const screenshotOutputFolder = path.join(outputFolder, `screenshots`);
      if (!fs.existsSync(screenshotOutputFolder)) {
        fs.mkdirSync(screenshotOutputFolder);
      }
      let output = path.join(
        screenshotOutputFolder,
        `-frame-${name}Metadata-%d.png`
      );
      output = getOSuri(output);

      const extraSettings = extraOptions ? extraOptions : "";

      pythonScreenShotsScript = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
${extraSettings}
clip = core.resize.Bicubic(clip, format=vs.RGB24, matrix_in_s="709")
clip = core.text.Text(clip,"${fileName}", alignment=8)
${screenshotsToTake}
${screenshotsCombined}
screenshots = core.imwri.Write(frames,imgformat="PNG",filename=(${output}),firstnum=1, overwrite=True)
screenshots.set_output()
`;

      fs.writeFileSync("ssPreview.py", pythonScreenShotsScript);

      await exec(`bin\\vspipe ssPreview.py .`);

      // fs.unlinkSync("ssPreview.py");

      renameScreenshots(screenshotOutputFolder, name, positions, true);
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = { createScreenshotsMetadata };
