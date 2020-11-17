const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const process = require("process");
const currentFolder = process.cwd();

const { renameScreenshots } = require("./utils.js");
const createScreenshotsMetadata = async ({
  video,
  jobId,
  folder,
  test,
  positions,
  resolutions,
  extraOptions,
}) => {
  try {
    //Get information about the video
    const extraSettings = extraOptions ? extraOptions : "";
    const fileName = path.win32.basename(video).match(/"$/)
      ? path.win32.basename(video).replace(/"$/, "")
      : path.win32.basename(video);

    for (const resolution of resolutions) {
      //creates resolition folder if it doesnt exists
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

      //for the screen shots
      let pythonScreenShotsScript;
      if (!jobId) {
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
      } else {
        if (!fs.existsSync(`job${jobId}`)) {
          fs.mkdirSync(`job${jobId}`);
        }
        if (!fs.existsSync(`job${jobId}/${folder}`)) {
          fs.mkdirSync(`job${jobId}/${folder}`);
        }
        if (!fs.existsSync(`job${jobId}/${folder}/screenshots`)) {
          fs.mkdirSync(`job${jobId}/${folder}/screenshots`);
        }

        pythonScreenShotsScript = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
${extraSettings}
clip = core.resize.Bicubic(clip, format=vs.RGB24, matrix_in_s="709")
clip = core.text.Text(clip,"${fileName}", alignment=8)
${screenshotsToTake}
${screenshotsCombined}
screenshots = core.imwri.Write(frames,imgformat="PNG",filename="job${jobId}/${folder}/screenshots/metadata-${test}-frame-%d.png",firstnum=1, overwrite=True)
screenshots.set_output()
`;
      }

      fs.writeFileSync("ssPreview.py", pythonScreenShotsScript);

      await exec(`vspipe ssPreview.py .`);

      const Folder = path.join(
        currentFolder,
        `job${jobId}/${folder}/screenshots`
      );
      renameScreenshots(Folder, test, positions, true);

      // fs.unlinkSync("ssPreview.py");
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = { createScreenshotsMetadata };
