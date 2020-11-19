const fs = require("fs");
const path = require("path");

const randomFrame = (frames) => {
  return Math.floor(Math.random() * frames) + 1;
};

const getOSuri = (videoSrc) => {
  if (videoSrc.match(/^\w:\\/)) {
    return `r"${videoSrc}"`;
  } else {
    return `"${videoSource}"`;
  }
};

const randomFrameDistribution = (numberOfFrames, numberOfScreenhots) => {
  const lowerLimit = numberOfFrames * 0.05;
  const portionSize = Math.round(
    (numberOfFrames - 2 * lowerLimit) / numberOfScreenhots
  );
  let framesToTake = [];
  for (let i = 0; i < numberOfScreenhots; i += 1) {
    let frameToTake = randomFrame(portionSize);
    frameToTake = Math.round(lowerLimit + frameToTake + portionSize * i);

    framesToTake = [...framesToTake, frameToTake];
  }

  return framesToTake;
};

const renameScreenshots = (folder, filter, frames, isMetadata) => {
  const screenshotsFolder = fs.readdirSync(folder);
  const screenshots = isMetadata
    ? screenshotsFolder
        .filter((filename) => filename.includes(filter))
        .filter((filename) => filename.match(/metadata/))
        .filter((format) => format.match(/.png$/))
    : screenshotsFolder
        .filter((filename) => filename.includes(filter))
        .filter((filename) => !filename.match(/metadata/))
        .filter((format) => format.match(/.png$/));

  let i = 0;
  for (const frame of frames) {
    const ogName = path.join(folder, screenshots[i]);
    const newScreenshot = screenshots[i].replace("-frame-", `-${frame}-`);
    const newName = path.join(folder, newScreenshot);
    fs.renameSync(ogName, newName);
    i += 1;
  }
  return;
};

const copyScreenshots = (ogFolder, destiniyFolder, filter) => {
  const screenshotsFolder = fs.readdirSync(ogFolder);
  const screenshots = screenshotsFolder
    .filter((filename) => filename.includes(filter))
    .filter((format) => format.match(/.png$/));

  for (const screenshot of screenshots) {
    const ogPath = path.join(ogFolder, screenshot);
    const newPath = path.join(destiniyFolder, screenshot);
    fs.copyFileSync(ogPath, newPath);
  }
  return;
};
module.exports = {
  copyScreenshots,
  getOSuri,
  randomFrame,
  randomFrameDistribution,
  renameScreenshots,
};
