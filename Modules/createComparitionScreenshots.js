const { createScreenshotsMetadata } = require("./createScreenshotsMetadata.js");
const createComparitionScreenshots = async ({
  ogVideo,
  encodedVideo,
  positions,
  outputFolder,
  ogExtraOptions,
}) => {
  try {
    await createScreenshotsMetadata({
      video: ogVideo,
      outputFolder,
      name: "Source",
      positions,
      extraOptions:ogExtraOptions,
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
