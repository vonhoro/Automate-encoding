const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

// Modules

const createClips = async (video, resolutions) => {
  if (!fs.existsSync("clips")) {
    fs.mkdirSync("clips");
  }
  for (const resolution of resolutions) {
    //creates resolition folder if it doesnt exists
    console.log(`Creating clip for ${resolution}`);
    const pythonShortClipsScript = `import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
select = core.std.Trim(clip,first=1000, last=clip.num_frames-1000)
select = core.std.SelectEvery(select,cycle=8000,offsets=range(50))
select = core.std.AssumeFPS(select,fpsnum=clip.fps.numerator,fpsden=clip.fps.denominator)
select.set_output()
`;
    fs.writeFileSync("previewClips.py", pythonShortClipsScript);

    const { stdout, stderr } = await exec(
      `bin\\vspipe previewClips.py --y4m - | bin\\x264 --demuxer y4m - --output clips/clip${resolution.toString()}.mkv`
    );

    fs.unlinkSync("previewClips.py");

    //printing all the information from x264

    console.log("\nX264 Logs\n");
    console.log(stderr);
    console.log(stdout);
    fs.writeFileSync(`./clips/${resolution}x264logs.txt`, stdout + stderr);
    console.log("-----------------------------------\n");
  }
  try {
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createClips };
// createClips(
// "C:\\Users\\Dan\\Downloads\\Anime\\Saekano\\Season1\\Season 2\\[Mysteria] Saenai Heroine no Sodatekata Flat - S01E11 v2 (BD 1080p HEVC FLAC) [2180AA83].mkv",
// [480, 576]
// );
