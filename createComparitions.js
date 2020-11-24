const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  currentFolder,
  getOSuri,
  randomFrameDistribution,
} = require("./Modules/utils.js");
const { getVideoInfo } = require("./Modules/getVideoInfo.js");
const { createScreenshots } = require("./Modules/createScreenshots.js");
const {
  createComparitionScreenshots,
} = require("./Modules/createComparitionScreenshots.js");
const {
  createScreenshotsMetadata,
} = require("./Modules/createScreenshotsMetadata.js");

const {
  askingConfirmation,
  askingInteger,
  askingNaturalNumber,
  askingText,
  askingVideo,
  closeQuestionInterface,
} = require("./Modules/questionsInterfaces.js");

const { toUploadimg } = require("./Modules/uploadOptions.js");

const { makeAdjustments } = require("./Modules/makeAdjustment.js");

const main = async () => {
  try {
    let formatOutput = `[mediainfo]
MEDIAINFO-PASTE-HERE
[/mediainfo]

[hide=x264 log]
X264-LOG-PASTE-HERE
[/hide]

[comparison=Source, Encode]

COMPARE

[/comparison]

[u][b]Screenshots[/b][/u]

SCREENSHOTS`;
    console.log(toUploadimg);

    const ogVideo = await askingVideo(
      "Put the  link of the original video before encoding\nExample: c:\\users\\videos\\my video.mkv\n"
    );
    const encodedVideo = await askingVideo(
      "Put the  link of the same video encoded \nExample: c:\\users\\videos\\my video encoded.mkv\n"
    );

    const numberOfScreenshots = await askingNaturalNumber(
      "Enter the number of comparition screenshots you want to take, default is 4\n",
      4
    );
    console.log(
      "The number of comparitions screenshtos will be: ",
      numberOfScreenshots
    );

    const { numberOfFrames } = await getVideoInfo(ogVideo);

    let encodedVideoMediaInfo = "";
    if (encodedVideo.match(/^r/)) {
      const { stdout, stderr } = await exec(
        `mediainfo ${encodedVideo.replace("r", "")}`
      );
      encodedVideoMediaInfo = stdout;
    } else {
      const { stdout, stderr } = await exec(`mediainfo ${encodedVideo}`);
      encodedVideoMediaInfo = stdout;
    }

    formatOutput = formatOutput.replace(
      "MEDIAINFO-PASTE-HERE",
      encodedVideoMediaInfo
    );

    let liked = false;
    let positions = [];
    do {
      fs.rmdirSync(path.join(currentFolder(), "screenshots"), {
        recursive: true,
      });
      positions = randomFrameDistribution(numberOfFrames, numberOfScreenshots);
      await createComparitionScreenshots({
        ogVideo,
        encodedVideo,
        outputFolder: currentFolder(),
        positions,
      });
      liked = await askingConfirmation(
        "Do you liked the comparition screenshots taken at the screenshot folder [Y/N] \nif you don't new ones Will be created\n"
      );
    } while (!liked);
    const ssPath = path.join(currentFolder(), "screenshots");

    const wantToAdjust = await askingConfirmation(
      "Do you want do a small adjusment of the frames taken so they match perfectly ? [Y]es [N]o?\n"
    );
    if (wantToAdjust) {
      await makeAdjustments({
        video: ogVideo,
        positions,
        outputFolder: currentFolder(),
        name: "Encoded",
        ssPath,
      });
    }
    let redo = true;
    console.log("Now we are taking the screenshots to show");
    do {
      const ss = fs.readdirSync(ssPath);
      const toShow = ss.filter((name) => name.match(/toShow/));

      if (toShow.length > 0) {
        for (const screensshot of toShow) {
          const fullPath = path.join(ssPath, screensshot);
          fs.unlinkSync(fullPath);
        }
      }
      const positions = randomFrameDistribution(numberOfFrames, 4);

      await createScreenshots({
        video: encodedVideo,
        outputFolder: currentFolder(),
        name: "toShow",
        positions,
      });
      redo = await askingConfirmation(
        "Do you want to redo the screenshots to show? [Y]es/[N]o\n"
      );
    } while (redo);

    const ss = fs.readdirSync(ssPath);
    const source = ss.filter((name) => name.match(/SourceMetadata/));

    const encoded = ss.filter((name) => name.match(/EncodedMetadata/));

    const toShow = ss.filter((name) => name.match(/toShow/));

    const uploadToPtp = await askingConfirmation(
      "Do you want to upload to ptp img? [Y]es, [N]o\n"
    );
    if (uploadToPtp) {
      let apiKey = await askingText(
        "Tenter your ptpimg.me api key \nExample: 43fe0fee-f935-4084-8a38-3e632b0be68c\n"
      );
      apiKey = apiKey.trim();
      const encodedUploaded = await toUploadimg(
        ssPath,
        encoded,
        apiKey,
        "ptpimg.me"
      );
      const sourceUploaded = await toUploadimg(
        ssPath,
        source,
        apiKey,
        "ptpimg.me"
      );
      const toShowUploaded = await toUploadimg(
        ssPath,
        toShow,
        apiKey,
        "ptpimg.me"
      );
      compare = "";
      for (let i = 0; i < encodedUploaded.length; i += 1) {
        compare += `${encodedUploaded[i]
          .replace("\n", "")
          .replace("\r", "")} ${sourceUploaded[i]
          .replace("\n", "")
          .replace("\r", "")}\n`;
      }
      let SCREENSHOTS = "";
      for (const picture of toShowUploaded) {
        SCREENSHOTS += `${picture.replace("\n", "").replace("\r", "")}\n`;
      }

      formatOutput = formatOutput
        .replace("COMPARE", compare)
        .replace("SCREENSHOTS", SCREENSHOTS);

      fs.writeFileSync("templateBBcode.txt", formatOutput);

      formatOutput = formatOutput
        .replace(/\[img\]/g, "")
        .replace(/\[\/img\]/g, "");
      fs.writeFileSync("template.txt", formatOutput);
    }
    const uploadToImgur = await askingConfirmation(
      "Do you want to upload to Imgur? [Y]es, [N]o\n"
    );
    if (uploadToImgur) {
      const encodedUploaded = await toUploadimg(ssPath, encoded, "", "imgur");
      const sourceUploaded = await toUploadimg(ssPath, source, "", "imgurl");
      const toShowUploaded = await toUploadimg(ssPath, toShow, "", "imgur");
      compare = "";
      for (let i = 0; i < encodedUploaded.length; i += 1) {
        compare += `${encodedUploaded[i]
          .replace("\n", "")
          .replace("\r", "")} ${sourceUploaded[i]
          .replace("\n", "")
          .replace("\r", "")}\n`;
      }
      let SCREENSHOTS = "";
      for (const picture of toShowUploaded) {
        SCREENSHOTS += `${picture.replace("\n", "").replace("\r", "")}\n`;
      }

      formatOutput = formatOutput
        .replace("COMPARE", compare)
        .replace("SCREENSHOTS", SCREENSHOTS);

      fs.writeFileSync("templateImgur.txt", formatOutput);
    }
    closeQuestionInterface();
  } catch (err) {
    console.log(err);
  }
};
main();
