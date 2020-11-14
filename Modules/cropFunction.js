const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const Jimp = require("jimp");
const addingPixelColors = (image, x, y) => {
  const { r, b, g, a } = Jimp.intToRGBA(image.getPixelColor(x, y));
  return r + g + b;
};
const cropVertically = async (folder, name) => {
  try {
    let removeTop = 0;
    let removeBottom = 0;
    let allRemoveTop = [];
    let allRemoveBottom = [];
    const filesInDir = fs.readdirSync(folder);
    const screenshots = filesInDir
      .filter((filename) => filename.includes(name))
      .filter((format) => format.match(/.png$/));

    let screenShotAnalisis = "";
    for (let screenshot of screenshots) {
      const pict = path.join(folder, screenshot);
      let removeTop = 0;
      let removeBottom = 0;
      const image = await Jimp.read(pict);
      const height = image.bitmap.height;
      const width = image.bitmap.width;
      let beforeHalf = true;
      for (let y = 0; y < height; y += 1) {
        let colorSum = 0;
        let x = 0;

        if (y > (height + 2) / 2) {
          beforeHalf = false;
        }

        do {
          colorSum += addingPixelColors(image, x, y);

          x += 1;
        } while (x <= width && colorSum / width < 50);

        if (x >= width && !beforeHalf) {
          removeTop += 1;
        }
        if (x >= width && beforeHalf) {
          removeBottom += 1;
        }
      }
      removeTop = removeTop % 2 === 0 ? removeTop : removeTop + 1;
      allRemoveTop = [...allRemoveTop, removeTop];
      removeBottom = removeBottom % 2 === 0 ? removeBottom : removeBottom + 1;
      allRemoveBottom = [...allRemoveBottom, removeBottom];

      console.log(
        `You may want to crop top=${removeTop} pixel startPosition and bottom=${removeBottom} of Image ${screenshot}`
      );
    }
    removeTop = Math.min(...allRemoveTop);
    removeBottom = Math.min(...allRemoveBottom);
    return { removeTop, removeBottom };
  } catch (err) {
    console.log(err);
  }
};

const cropHorizontally = async (folder, name) => {
  try {
    let removeLeft = 0;
    let removeRight = 0;
    let allRemoveLeft = [];
    let allRemoveRight = [];
    const filesInDir = fs.readdirSync(folder);
    const screenshots = filesInDir
      .filter((filename) => filename.includes(name))
      .filter((format) => format.match(/.png$/));

    let screenShotAnalisis = "";
    for (let screenshot of screenshots) {
      const pict = path.join(folder, screenshot);

      const image = await Jimp.read(pict);
      const height = image.bitmap.height;
      const width = image.bitmap.width;
      let removeLeft = 0;
      let removeRight = 0;
      let beforeHalf = true;
      for (let x = 0; x < width; x += 1) {
        let colorSum = 0;
        let y = 0;

        if (x > (width + 2) / 2) {
          beforeHalf = false;
        }

        do {
          colorSum += addingPixelColors(image, x, y);

          y += 1;
        } while (y <= height && colorSum / height < 50);

        if (y >= height && beforeHalf) {
          removeLeft += 1;
        }
        if (y >= height && !beforeHalf) {
          removeRight += 1;
        }
      }
      removeRight = removeRight % 2 === 0 ? removeRight : removeRight + 1;
      allRemoveRight = [...allRemoveRight, removeRight];
      removeLeft = removeLeft % 2 === 0 ? removeLeft : removeLeft + 1;
      allRemoveLeft = [...allRemoveLeft, removeLeft];

      console.log(
        `You may want to remove rigth = ${removeRight}  left=${removeLeft} of Image ${screenshot}`
      );
    }
    removeLeft = Math.min(...allRemoveLeft);
    removeRight = Math.min(...allRemoveRight);
    return { removeRight, removeLeft };
  } catch (err) {
    console.log(err);
  }
};

module.exports = { cropVertically, cropHorizontally };
