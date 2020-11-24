const fs = require("fs");
const path = require("path");
const {
  askingConfirmation,
  askingInteger,
} = require("./questionsInterfaces.js");
const { createScreenshotsMetadata } = require("./createScreenshotsMetadata.js");

const makeAdjustments = async ({
  video,
  positions,
  outputFolder,
  name,
  ssPath,
}) => {
  try {
    const adjustment = await askingInteger(
      "Input the number of frames you want to add or  subtract from the encoded screen so they match \nExamples: \nif the frames are 2100 and 2380, inputting -10 will take screenshots of frames 2090 and 2370\nif you input 20 they will be 2120 and 2400 \n"
    );
    console.log("The adjustment will be:", adjustment);
    let adjustedPositions = positions.map((frame) => frame + adjustment);
    const ssToDelete = fs.readdirSync(ssPath).filter((fileName) => {
      if (fileName.includes(name)) {
        return fileName;
      }
    });
    for (const ss of ssToDelete) {
      const fullPath = path.join(ssPath, ss);
      fs.unlinkSync(fullPath);
    }

    await createScreenshotsMetadata({
      video,
      outputFolder,
      name,
      positions: adjustedPositions,
    });
    const liked = await askingConfirmation(
      "Do you like the resutls? [Y]es [N]o ?\n"
    );
    if (liked) return;
    await makeAdjustments({
      video,
      positions: adjustedPositions,
      outputFolder,
      name,
      ssPath,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { makeAdjustments };
