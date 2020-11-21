const fs = require("fs");
const path = require("path");
const process = require("process");
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
        .filter((filename) => filename.match(/Metadata/))
        .filter((format) => format.match(/.png$/))
    : screenshotsFolder
        .filter((filename) => filename.includes(filter))
        .filter((filename) => !filename.match(/Metadata/))
        .filter((format) => format.match(/.png$/));

  const sortedScreenshots = screenshots.sort((a, b) => {
    const numberALocation = a.lastIndexOf("-") + 1;
    const numberA = parseInt(a.slice(numberALocation).replace(".png", ""));
    const numberBLocation = b.lastIndexOf("-") + 1;
    const numberB = parseInt(b.slice(numberBLocation).replace(".png", ""));
    return numberA - numberB;
  });

  let i = 0;
  for (const frame of frames) {
    const ogName = path.join(folder, sortedScreenshots[i]);
    const newScreenshot = sortedScreenshots[i]
      .replace("-frame-", `${frame}`)
      .replace(/-\d+.png/, ".png");
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

const currentFolder = () => process.cwd();

module.exports = {
  copyScreenshots,
  currentFolder,
  getOSuri,
  randomFrame,
  randomFrameDistribution,
  renameScreenshots,
};
