const path = require("path");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const crypto = require("crypto");
const process = require("process");
const jobId = crypto.randomBytes(4).toString("hex");
const currentFolder = process.cwd();
const testCRF = async ({
  video,
  resolution,
  Every,
  Offset,
  Length,
  extraOptions,
}) => {
  try {
    // 1080p 8-14 Mbps
    // 720p 4-9 Mbps
    // 576p 2-5 Mbps
    // 480p 1.5-3.5mbps
    let targetBitrate;
    let ref;
    // kb\s /1024
    switch (resolution) {
      case 480:
        targetBitrate = [1.5, 3.5];
        ref = 16;
        break;
      case 576:
        targetBitrate = [2, 5];
        ref = 12;
        break;
      case 720:
        targetBitrate = [4, 9];
        ref = 9;
        break;
      case 1080:
        targetBitrate = [8, 14];
        ref = 4;
        break;
    }

    const offset = Offset ? Offset : 10000;
    const every = Every ? Every : 3000;
    const length = Length ? Length : 50;
    const settingLocation = path.join(currentFolder, "vsSetting.py");
    const x264SettingLocation = path.join(currentFolder, `x264-setting.txt`);
    const x264Setting = fs
      .readFileSync(x264SettingLocation, "utf8")
      .replace("--ref", `--ref ${ref}`)
      .trim();
    let testText;
    if (fs.existsSync(settingLocation)) {
      testText = fs.readFileSync(settingLocation, "utf8");
      testText += `
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
select = core.std.Trim(clip, first=${offset}, last=clip.num_frames-${offset})
select = core.std.SelectEvery(select, cycle=${every}, offsets=range(${length}))
select = core.std.AssumeFPS(select, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
select.set_output()
`;
    } else {
      testText = `
from vapoursynth import core
clip = core.ffms2.Source(${video})
${extraOptions}
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
select = core.std.Trim(clip, first=${offset}, last=clip.num_frames-${offset})
select = core.std.SelectEvery(select, cycle=${every}, offsets=range(${length}))
select = core.std.AssumeFPS(select, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
select.set_output()
`;
    }
    console.log(testText);
    fs.writeFileSync(`testCRF.py`, testText);
    console.log(`Saved test script`);
    let crf = 17.0; // higher means lower bitrate
    let bitrate = (targetBitrate[0] + targetBitrate[1]) / 2;
    let diff = 0;
    let adjust = 0;
    console.log(`Beginning CRF calibration...\n`);
    do {
      const testCommand = `bin\\vspipe --y4m testCRF.py - | ${x264Setting} --crf ${crf} `;
      console.log(`Starting x264 test for CRF=${crf}`);

      const { stdout, stderr } = await exec(testCommand);

      let output = stderr + stdout;
      const lastLine = output.split(/encoded/i)[1].split(",");
      const bitrateData = lastLine
        .filter((isBitrate) => isBitrate.match(/kb\/s$/))[0]
        .trim();

      const bitrate = parseFloat(bitrateData.replace(" kb/s", "")) / 1024;
      console.log(stdout);
      console.log(bitrate);

      diff = 0;
      if (bitrate > Math.max(...targetBitrate)) {
        diff = bitrate - Math.max(...targetBitrate);
      }
      if (bitrate < Math.min(...targetBitrate)) {
        diff = Math.min(...targetBitrate) - bitrate;
      }

      if (diff >= 2) {
        adjust = 2;
      } else if (diff < 2 && diff > 1) {
        adjust = 1;
      } else if (diff <= 1) {
        adjust = 0.5;
      }
      console.log(adjust);
      if (diff !== 0) {
        if (bitrate > Math.max(...targetBitrate)) {
          crf += adjust;
        } else {
          crf -= adjust;
        }
      }
      console.log(targetBitrate);
    } while (diff !== 0);
    return crf;
  } catch (error) {
    console.log(error);
  }
};
module.exports = { testCRF };
// testCRF({
// video: "C:\\Users\\Administrator\\Desktop\\Example Remux\\remux.mkv",
// resolution: 1080,
// Every: 200,

// Offset: 210,
// });
