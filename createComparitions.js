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

const Upload = async (picture, key) => {
  try {
    const { stdout } = await exec(`ptpimg_uploader -k ${key} -b "${picture}"`);

    return stdout;
  } catch (err) {
    return "";
  }
};

const toUploadimg = async (folder, pictures) => {
  let uploadedPicture = [];
  for (const picture of pictures) {
    const input = path.join(folder, picture);

    let uploadedImgurl = "";
    do {
      uploadedImgurl = await Upload(input);

      if (uploadedImgurl === "") {
        console.log("An error ocurred, waiting 2 seconds before retrying");
        await new Promise((r) => setTimeout(r, 2000));
      }
    } while (uploadedImgurl === "");

    uploadedPicture = [...uploadedPicture, uploadedImgurl];
  }

  return uploadedPicture;
};

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

const createComparitionSceenshots = async ({
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
      await createComparitionSceenshots({
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
    const apiKey = await askingText(
      "Tenter your ptpimg.me api key \nExample: 43fe0fee-f935-4084-8a38-3e632b0be68c\n"
    ).trim();
    const encodedUploaded = await toUploadimg(ssPath, encoded, apiKey);
    const sourceUploaded = await toUploadimg(ssPath, source, apiKey);
    const toShowUploaded = await toUploadimg(ssPath, toShow, apiKey);
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

    closeQuestionInterface();
  } catch (err) {
    console.log(err);
  }
};
main();
