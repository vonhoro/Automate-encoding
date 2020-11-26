const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const testVideo = async ({
  testFolder,
  video,
  test,
  resolution,
  fps,
  extraOptions,
}) => {
  try {
    const videoTest = `from vapoursynth import core  
clip = core.ffms2.Source(${video})
${extraOptions}
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
nframes = clip.num_frames
numberSS = 7
offset = round(nframes*.15)
cycle =round(nframes*.7/(numberSS)) 
clip = core.std.Trim(clip, first=offset, last=clip.num_frames-offset)
clip = core.std.SelectEvery(clip, cycle, offsets=range(60))
clip = core.std.AssumeFPS(clip, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
clip.set_output() 
`;

    fs.writeFileSync("preview.py", videoTest);

    let newVideo = test
      .split(" ")
      .filter((setting) => setting.match(/.mkv$/))[0];
    let ref;
    switch (resolution) {
      case 1080:
        ref = 4;
        break;
      case 720:
        ref = 9;
        break;
      case 576:
        ref = 12;
        break;
      default:
        ref = 16;
    }
    const videoOutput = path.join(testFolder, newVideo);

    const updatedx264Test = test
      .replace(newVideo, `"${videoOutput}"`)
      .replace("--min-keyint", `--min-keyint ${fps}`)
      .replace("--ref", `--ref ${ref}`);
    newVideo = newVideo.replace(".mkv", "");
    const { stdout, stderr } = await exec(
      `bin\\vspipe preview.py --y4m - | ${updatedx264Test}`
    );
    let log = `Setting Used = ${updatedx264Test} \n${stdout}\n${stderr}`;
    const x264Log = path.join(testFolder, `${newVideo}-log.txt`);
    fs.writeFileSync(x264Log, log);
    return { newVideo, newVideoSrc: videoOutput };
  } catch (err) {
    console.log(err);
  }
};

module.exports = { testVideo };
