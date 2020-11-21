const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ptpimg_uploader -k f7d7f0e9-2f23-4147-bba7-c0ea92d28403
// Modules
// C:\Users\Dan\Downloads\Anime\Saekano\Season1\[Mysteria] Saenai Heroine no Sodatekata - S01E00 (BD 1080p HEVC FLAC) [9C9BF852].mkv
// C:\Users\Dan\Downloads\Anime\Saekano\Season1\[Mysteria] Saenai Heroine no Sodatekata - S01E09 (BD 1080p HEVC FLAC) [DA916DB5].mkv
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

// const Upload = async (picture) => {
// try {
// const { stdout } = await exec(
// `ptpimg_uploader -k f7d7f0e9-2f23-4147-bba7-c0ea92d28403 -b "${picture}"`
// );

// return stdout;
// } catch (err) {
// return "";
// }
// };

// const toUploadimg = async (folder, pictures) => {
// let uploadedPicture = [];
// for (const picture of pictures) {
// const input = path.join(folder, picture);

// let uploadedImgurl = "";
// do {
// uploadedImgurl = await Upload(input);

// if (uploadedImgurl === "") {
// console.log("An error ocurred, waiting 2 seconds before retrying");
// await new Promise((r) => setTimeout(r, 2000));
// }
// } while (uploadedImgurl === "");

// uploadedPicture = [...uploadedPicture, uploadedImgurl];
// }

// return uploadedPicture;
// };

const createComparitionSceenshots = async ({
  ogVideo,
  encodedVideo,
  ogPositions,
  encodedPositions,
  outputFolder,
}) => {
  try {
    await createScreenshotsMetadata({
      video: ogVideo,
      outputFolder,
      name: "Source",
      positions: ogPositions,
    });

    await createScreenshotsMetadata({
      video: encodedVideo,
      outputFolder,
      name: "Encoded",
      positions: encodedPositions,
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
    do {
      fs.rmdirSync(path.join(currentFolder(), "screenshots"), {
        recursive: true,
      });
      const positions = randomFrameDistribution(
        numberOfFrames,
        numberOfScreenshots
      );
      await createComparitionSceenshots({
        ogVideo,
        encodedVideo,
        outputFolder: currentFolder(),
        ogPositions: positions,
        encodedPositions: positions,
      });
      liked = await askingConfirmation(
        "Do you liked the screenshots taken at the screenshot folder [Y/N] \nif you don't new ones Will be created\n"
      );
    } while (!liked);
    const ssPath = path.join(currentFolder, "screenshots");
    const ss = fs.readdirSync(ssPath);
    const source = ss.filter((name) => name.match(/SourceMetadata/));
    const encoded = ss.filter((name) => name.match(/EncodedMetadata/));

    const adjustment = await askingInteger(
      "Input the number of frames you want to add or  subtract from the encoded screen so they match \nExamples: \nif the frames are 2100 and 2380, inputting -10 will take screenshots of frames 2090 and 2370\nif you input 20 they will be 2120 and 2400 \n"
    );
    console.log("The adjustment will be:", adjustment);

    // const otherPositions = randomFrameDistribution(numberOfFrames, 4);
    // await createScreenshots({
    // video: encodedVideo,
    // outputFolder: currentFolder,
    // name: "Encoded",
    // positions: otherPositions,
    // });

    // const toShow = ss.filter((name) => name.match(/Encoded.png/));

    // const doYouLike

    // const encodedUploaded = await toUploadimg(ssPath, encoded);
    // const sourceUploaded = await toUploadimg(ssPath, source);
    // const toShowUploaded = await toUploadimg(ssPath, toShow);
    // compare = "";
    // for (let i = 0; i < encodedUploaded.length; i += 1) {
    // compare += `${encodedUploaded[i]
    // .replace("\n", "")
    // .replace("\r", "")} ${sourceUploaded[i]
    // .replace("\n", "")
    // .replace("\r", "")}\n`;
    // }
    // let SCREENSHOTS = "";
    // for (const picture of toShowUploaded) {
    // SCREENSHOTS += `${picture.replace("\n", "").replace("\r", "")}\n`;
    // }

    // formatOutput = formatOutput
    // .replace("COMPARE", compare)
    // .replace("SCREENSHOTS", SCREENSHOTS);

    // fs.writeFileSync("templateBBcode.txt", formatOutput);

    // formatOutput = formatOutput
    // .replace(/\[img\]/g, "")
    // .replace(/\[\/img\]/g, "");
    // fs.writeFileSync("template.txt", formatOutput);
    // rl.close();
    closeQuestionInterface();
  } catch (err) {
    console.log(err);
  }
};
main();
