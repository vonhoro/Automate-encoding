const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const testVideo = async ({
  currentFolder,
  video,
  jobId,
  test,
  name,
  extraOptions,
}) => {
  try {
    const videoTest = `from vapoursynth import core  
clip = core.ffms2.Source(${video})
${extraOptions}
extract = clip[10000:80000]
extract = core.std.SelectEvery(extract, cycle=10000, offsets=range(60))
extract = core.std.AssumeFPS(extract, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
extract.set_output() 
`;

    fs.writeFileSync("preview.py", videoTest);

    let newVideo = test
      .split(" ")
      .filter((setting) => setting.match(/.mkv$/))[0];

    const updatedx264Test = test.replace(
      newVideo,
      `job${jobId}/${name}/${newVideo}`
    );
    let newVideoSrc = path.join(
      currentFolder,
      `job${jobId}/${name}/${newVideo}`
    );
    newVideo = newVideo.replace(".mkv", "");
    const { stdout, stderr } = await exec(
      `bin\\vspipe preview.py --y4m - | ${updatedx264Test}`
    );
    let log = `Setting Used = ${updatedx264Test} \n${stdout}\n${stderr}`;

    fs.writeFileSync(`./job${jobId}/${name}/${newVideo}-log.txt`, log);
    return { newVideo, newVideoSrc };
  } catch (err) {
    console.log(err);
  }
};

module.exports = { testVideo };
