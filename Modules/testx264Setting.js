const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const testx264Setting = async ({
  video,
  jobId,
  test,
  testName,
  testFolder,
  extraOptions,
}) => {
  try {
    const processFirstTest = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video}) 
${extraOptions}
extract = clip[10000:80000]
extract = core.std.SelectEvery(extract, cycle=10000, offsets=range(60))
extract = core.std.AssumeFPS(extract, fpsnum=clip.fps.numerator, fpsden=clip.fps.denominator)
extract.set_output() 
`;

    fs.writeFileSync("test.py", processFirstTest);

    const { stdout, stderr } = await exec(`bin\\vspipe test.py --y4m - | ${test}`);
    // fs.unlinkSync("test.py");
    let log = `Setting Used = ${test} \n${stdout}\n${stderr}`;
    fs.writeFileSync(`./job${jobId}/${testFolder}/${testName}-log.txt`, log);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { testx264Setting };
