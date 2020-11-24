const { createScreenshotsMetadata } = require("./createScreenshotsMetadata.js");
const createComparitionScreenshots = async ({
  ogVideo,
  encodedVideo,
  positions,
  outputFolder,
}) => {
  try {
    await createScreenshotsMetadata({
      video: ogVideo,
      outputFolder,
      name: "Source",
      positions,
    });

    await createScreenshotsMetadata({
      video: encodedVideo,
      outputFolder,
      name: "Encoded",
      positions,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createComparitionScreenshots };
