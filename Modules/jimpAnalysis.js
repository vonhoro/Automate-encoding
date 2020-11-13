const path = require("path");
const fs = require("fs");

const Jimp = require("jimp");
const { Pixel } = require("./Pixel.js");

const SETTINGS = {
  BASE_FILENAME: "base.vs",
  TARGET_BITRATE: 9000,
  TOLERANCE: 500,
  BLACK_THRESHOLD: 30,
  ROW_TO_ROW_THRESHOLD: 5,
};
const jimpAnalysis = async (ssPath, test) => {
  try {
    const filesInDir = fs.readdirSync(ssPath);
    const screenshots = filesInDir
      .filter((filename) => filename.includes(test))
      .filter((filename) => !filename.match(/^metadata/))
      .filter((format) => format.match(/.png$/));
    let screenShotAnalisis = "";
    for (let screenshot of screenshots) {
      const pict = path.join(ssPath, screenshot);
      const image = await Jimp.read(pict);
      const HEIGHT = image.bitmap.height;
      const WIDTH = image.bitmap.width;

      let y = 0;
      let blackFlag = true;
      let previousRow = rowAverage(image, 0);

      while (y < HEIGHT && blackFlag === true) {
        const row = rowAverage(image, y);

        if (
          Math.abs(row.color.net - previousRow.color.net) >
          SETTINGS.ROW_TO_ROW_THRESHOLD
        ) {
          // console.log(
          // `[${screenshot}] Row #${y}: Found an average delta greater than threshold!\n`
          // );
          screenShotAnalisis += `[${screenshot}] Row #${y}: Found an average delta greater than threshold!\n`;
          // console.log(
          // `[${screenshot}] Previous row: ${previousRow.toString()}\n`
          // );
          screenShotAnalisis += `[${screenshot}] Previous row: ${previousRow.toString()}\n`;
          // console.log(`[${screenshot}] Current row: ${row.toString()}`);
          screenShotAnalisis += `[${screenshot}] Current row: ${row.toString()}\n`;
          blackFlag = false;
        }

        previousRow = row;
        y++;
      }

      y--;

      // console.log(`[${screenshot}] Black border at top is ${y} pixels tall`);
      screenShotAnalisis += `[${screenshot}] Black border at top is ${y} pixels tall\n`;
    }
    const parentFolder = path.dirname(ssPath);
    const analisysFolder = path.join(parentFolder, `Analysis`);
    if (!fs.existsSync(analisysFolder)) {
      fs.mkdirSync(analisysFolder);
    }

    const logOutput = path.join(analisysFolder, `${test}.txt`);
    fs.writeFileSync(logOutput, screenShotAnalisis);
    return screenShotAnalisis;
  } catch (error) {
    console.log(error);
  }
};

const rowAverage = (image, rowIndex) => {
  const WIDTH = image.bitmap.width;
  let row = Pixel({ r: 0, g: 0, b: 0 });

  for (let x = 0; x < WIDTH; x++) {
    const rgbPixel = Jimp.intToRGBA(image.getPixelColor(x, rowIndex));
    row.add(rgbPixel);
  }

  row.average(WIDTH);
  return row;
};
module.exports = { jimpAnalysis };
