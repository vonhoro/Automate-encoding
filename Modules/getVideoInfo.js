const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

const getVideoInfo = async (video) => {
  try {
    const getInfoScript = `
import vapoursynth as vs
core = vs.get_core()
video = core.ffms2.Source(${video})
video.set_output()
`;

    fs.writeFileSync("videoInfo.py", getInfoScript);

    const { stdout, stderr } = await exec(`bin\\vspipe videoInfo.py -i -`);
    console.log(stdout);
    fs.unlinkSync("videoInfo.py");
    // take out the frames information
    const stdoutArray = stdout.split("\n");
    // console.log(stdoutArray);

    const sourceWidthArray = stdoutArray.filter((detail) =>
      detail.includes("Width:")
    );
    const sourceWidth = parseInt(sourceWidthArray[0].replace("Width: ", ""));

    const sourceHeightArray = stdoutArray.filter((detail) =>
      detail.includes("Height:")
    );

    const sourceHeight = parseInt(sourceHeightArray[0].replace("Height: ", ""));

    const frameArray = stdoutArray.filter((detail) =>
      detail.includes("Frames:")
    );

    // converting the frames to a number

    const numberOfFrames = parseInt(frameArray[0].replace("Frames: ", ""));
    const FPSArray = stdoutArray.filter((detail) => detail.includes("FPS:"));

    // converting the frames to a number

    const FPS = FPSArray[0].replace("FPS: ", "");
    const FPSNumber = parseFloat(FPS.replace(/(\d*\/\d* \()|( fps\))/g, ""));

    // Take out the width of the source

    const bitsArray = stdoutArray.filter((detail) => detail.includes("Bits:"));

    const Bits = parseInt(bitsArray[0].replace("Bits: ", ""));

    return {
      numberOfFrames,
      sourceWidth,
      sourceHeight,
      FPS,
      FPSNumber,
      Bits,
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getVideoInfo };
