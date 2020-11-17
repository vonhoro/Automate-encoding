const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
//Modules

const { randomFrame } = require("./utils.js");

const { getVideoInfo } = require("./getVideoInfo.js");

const createScreenshotsMetadata = async (video, resolutions) => {
  try {
    //Get information about the video
    const fileName = path.win32.basename(video);
    const { sourceWidth, sourceHeight, numberOfFrames } = await getVideoInfo(
      video
    );

    //Making 6 pictures  one for a random frame
    console.log(numberOfFrames);
    const framesNumbers = [...new Array(6)].map((_) =>
      randomFrame(numberOfFrames)
    );

    for (const resolution of resolutions) {
      //creates resolition folder if it doesnt exists

      if (!fs.existsSync(resolution.toString())) {
        fs.mkdirSync(resolution.toString());
      }
      const aspectRatio = sourceWidth / sourceHeight;
      const width = Math.round((resolution * aspectRatio) / 2) * 2;
      const height = resolution;
      //for the screen shots

      const pythonScreenShotsScript = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(r"${video}")
clip = core.resize.Bicubic(clip, format=vs.RGB24, matrix_in_s="709")
clip = core.resize.Spline36(clip,width=${width},height=${height})
clip = core.text.Text(clip,"${resolution}  ${fileName}", alignment=8)
ss1 = clip[${framesNumbers[0]}]
ss1 = core.text.Text(ss1,"\\nFrame ${framesNumbers[0]} of ${numberOfFrames}",alignment=8)
ss1 = core.text.ClipInfo(ss1, alignment=7)
ss2 = clip[${framesNumbers[1]}]
ss2 = core.text.Text(ss2,"\\nFrame ${framesNumbers[1]} of ${numberOfFrames}",alignment=8)
ss2 = core.text.ClipInfo(ss2, alignment=7)
ss3 = clip[${framesNumbers[2]}]
ss3 = core.text.Text(ss3,"\\nFrame ${framesNumbers[2]} of ${numberOfFrames}",alignment=8)
ss3 = core.text.ClipInfo(ss3, alignment=7)
ss4 = clip[${framesNumbers[3]}]
ss4 = core.text.Text(ss4,"\\nFrame ${framesNumbers[3]} of ${numberOfFrames}",alignment=8)
ss4 = core.text.ClipInfo(ss4, alignment=7)
ss5 = clip[${framesNumbers[4]}]
ss5 = core.text.Text(ss5,"\\nFrame ${framesNumbers[4]} of ${numberOfFrames}",alignment=8)   
ss5 = core.text.ClipInfo(ss5, alignment=7)
ss6 = clip[${framesNumbers[5]}]
ss6 = core.text.Text(ss6,"\\nFrame ${framesNumbers[5]} of ${numberOfFrames}",alignment=8)
ss6 = core.text.ClipInfo(ss6, alignment=7)
frames = ss1 + ss2 + ss3 + ss4 + ss5 + ss6
screenshots = core.imwri.Write(frames,imgformat="PNG",filename="/${resolution}/pictpreview%d.png",firstnum=1, overwrite=True)
screenshots.set_output()
`;

      fs.writeFileSync("ssPreview.py", pythonScreenShotsScript);

      console.log(`\nSetting up ${resolution} group\n`);

      await exec(`bin\\vspipe ssPreview.py .`);

      // to create short clips to preview
    }
  } catch (error) {
    console.log(error);
  }
};

// createScreenshotsMetadata(
// "C:\\Users\\Dan\\Downloads\\Anime\\Saekano\\Season 2\\[Mysteria] Saenai Heroine no Sodatekata Flat - S01E07 v2 (BD 1080p HEVC FLAC) [AC6A9A46].mkv",
// [1080, 720, 576, 480]
// );
