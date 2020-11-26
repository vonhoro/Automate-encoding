const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const process = require("process");
const readline = require("readline");
let cropTries = 1;
const currentFolder = process.cwd();

// Modules

const { getVideoInfo } = require("./Modules/getVideoInfo.js");
const { createScreenshots } = require("./Modules/createScreenshots.js");
const { testCRF } = require("./Modules/testCRF.js");
const {
  createScreenshotsMetadata,
} = require("./Modules/createScreenshotsMetadata.js");
const { jimpAnalysis } = require("./Modules/jimpAnalysis.js");
const {
  cropHorizontally,
  cropVertically,
} = require(`./Modules/cropFunction.js`);
const { encodeAudio } = require("./Modules/encodeAudio.js");
const { getTracksInfo } = require("./Modules/getTracksInfo.js");
const { extractTracks } = require("./Modules/extractTracks.js");
const { mergeEncoded } = require("./Modules/mergeEncoded.js");
const {
  copyScreenshots,
  getOSuri,
  randomFrame,
  randomFrameDistribution,
  renameScreenshots,
} = require("./Modules/Utils.js");
const { dox264Tests } = require("./Modules/dox264Tests.js");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askingTitle = () => {
  return new Promise((resolve, reject) =>
    rl.question(
      "Enter Title of the track, if you dont input anything it will have the same\n",
      async (title) => {
        resolve(title);
      }
    )
  );
};
const askingLanguage = () => {
  return new Promise((resolve, reject) =>
    rl.question(
      "Enter language of the track, if you dont input anything it will have the sam\n",
      async (language) => {
        resolve(language);
      }
    )
  );
};
const askingForVideo = () => {
  return new Promise((resolve, reject) =>
    rl.question(
      "Enter the video Link (Only mkv videos will work) \nExample: c:\\users\\videos\\my video.mkv\n ",
      async (videoLink) => {
        const video = getOSuri(videoLink);
        resolve(video);
      }
    )
  );
};
const askingNumber = (msg, defaultNumber) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (number) => {
      if (number.match(/^\d+$/)) resolve(parseInt(number));
      resolve(defaultNumber);
    })
  );
};

const askingConfirmation = (msg) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (confirm) => {
      if (confirm.match(/^y$/i)) resolve(true);
      resolve(false);
    })
  );
};

const main = async () => {
  try {
    console.log("This will be the first test of doing everything to encode\n");
    const video = await askingForVideo();

    let vsSetting = `
import vapoursynth as vs
core = vs.get_core()
clip = core.ffms2.Source(${video})
`;
    console.log("First we are looking for the crop settings\n");
    const numberOfScreenshots = await askingNumber(
      "Enter the number of Sceenshots you want for the crop test(it has to be an integer), if you use an invalid number or just press enter it will default to 15\n",
      15
    );
    console.log(numberOfScreenshots, " Screenshots will be made\n");
    const { numberOfFrames, sourceHeight, FPSNumber } = await getVideoInfo(
      video
    );
    const fps = Math.round(FPSNumber);
    const positions = randomFrameDistribution(
      numberOfFrames,
      numberOfScreenshots
    );
    const cropOutput = path.join(
      currentFolder,
      `Crop preview/Take number - ${cropTries}`
    );
    if (!fs.existsSync(cropOutput)) {
      fs.mkdirSync(cropOutput, { recursive: true });
    }
    await createScreenshots({
      video,
      outputFolder: cropOutput,
      name: "crop",
      positions,
    });
    const folder = path.join(
      currentFolder,
      `Crop preview/Take number - ${cropTries}/screenshots`
    );
    const { removeTop, removeBottom } = await cropVertically(folder, "crop");
    const { removeRight, removeLeft } = await cropHorizontally(folder, "crop");

    console.log(
      `the recomended crop setting is\n clip = core.std.Crop(clip, left=${removeLeft}, right=${removeRight},top = ${removeTop},bottom = ${removeBottom})\n`
    );
    console.log("Proccesing cropped previews with recomended settings");
    const extraOptions = `clip = core.std.Crop(clip, left=${removeLeft}, right=${removeRight},top = ${removeTop},bottom = ${removeBottom})
     `;
    await createScreenshots({
      video,
      outputFolder: cropOutput,
      name: "Cropped",
      positions,
      extraOptions,
    });
    console.log(
      `You can see all screenshots at Crop preview/Take number - ${cropTries} with the suggested options\n`
    );

    const useSetting = await askingConfirmation(
      "Do you want to use those Settings ? \nSend [Y] or [y] if you are\nSend other letter if you are not\n"
    );

    if (useSetting) {
      vsSetting += extraOptions;
    } else {
      vsSetting +=
        "clip = core.std.Crop(clip, left=number, right=number,top = number,bottom = number)\n";

      console.log(
        "Edit the settings on the vsSetting.py with this format\nclip = core.std.Crop(clip, left=number, right=number,top = number,bottom = number)\n all numbers most be odd numbers\nIf you know what you are doing you can also add filters\nDon't set up the .set_output, and make all the filters to equal to clip\n"
      );
    }
    fs.writeFileSync("vsSetting.py", vsSetting);
    console.log("Now is time to decide what x264 settings to use\n");
    console.log("An analysis using the cropped screenshots will be done\n");
    const folderOfSS = path.join(
      currentFolder,
      `Crop preview/Take number - ${cropTries}/screenshots`
    );
    const analysis = await jimpAnalysis(folderOfSS, "Cropped");
    console.log(`Analysis result:\n treshhold = 5 \n${analysis}`);
    const testX264Settings = await askingConfirmation(
      "Given those results  do you know what settings to use? \nSend [Y] or [y] if you do \nSend other input if you don't\n"
    );
    const x264SettingFormat = `bin\\x264 --demuxer y4m  --output encoded.mkv - Add Your flags here`;
    fs.writeFileSync(`x264-setting.txt`, x264SettingFormat);
    const p2pTemplate = await askingConfirmation(
      "Do you want to use p2p templated x264 settings y/n \n"
    );
    let isPtp = false;
    let isAnime = false;
    if (p2pTemplate) {
      isPtp = true;

      let p2pformat = "";
      const animeQuestion = await askingConfirmation(
        "Is the video an Anime? \n"
      );

      if (animeQuestion) {
        isAnime = true;
        p2pformat = `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --output encoded.mkv - --ref --min-keyint ${fps} --aq-mode 2 --aq-strength EDIT --deblock EDIT --qcomp EDIT --psy-rd EDIT`;
      } else {
        p2pformat = `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --output encoded.mkv - --ref --min-keyint ${fps} --aq-mode EDIT --aq-strength EDIT --qcomp EDIT --psy-rd EDIT`;
      }
      fs.writeFileSync(`x264-setting.txt`, p2pformat);
    }
    const areyousure = await askingConfirmation(
      "Are you sure you want to do the tests ? [Y]es or [N]ot\n"
    );

    if (!testX264Settings && areyousure) {
      await dox264Tests({
        video,
        extraOptions,
        isAnime,
        isPtp,
        fps,
        resolution: sourceHeight,
      });

      console.log(
        `Edit x264-setting.txt with the settings you want to use dont change the demuxer or the input "-"\n`
      );
    }
    let confifrmEdittedx264 = false;
    do {
      confifrmEdittedx264 = await askingConfirmation(
        "Once you finished editing press [Y]  or [y]"
      );
    } while (!confifrmEdittedx264);

    console.log(
      "Now is time to look for the CRF settings  on the resolutions you want to encode on\n"
    );
    const Resolutions = [480, 576, 720, 1080];
    const ref = [16, 12, 9, 4];
    let crfValues = [0, 0, 0, 0];
    let i = 0;
    for (const resolution of Resolutions) {
      const confirmation = await askingConfirmation(
        `Do you want To encode on ${resolution}p, send [y] or [Y] to confirm, any other letter to not\n`
      );
      if (confirmation) {
        const Every = await askingNumber(
          "Enter the number frames to skip for  cycle on the test script(it has to be an integer), if you use an invalid number or just press enter it will default to 3000\n",
          3000
        );
        const Length = await askingNumber(
          "Enter the number frames of each scene for the test script(it has to be an integer), if you use an invalid number or just press enter it will default to 50\n",
          50
        );
        const Offset = await askingNumber(
          "Enter the number of frames to offset from the start and end of the video those frames will be not taken for the test on the test script(it has to be an integer), if you use an invalid number or just press enter it will default to 10000\n",
          10000
        );

        const crf = await testCRF({
          video,
          resolution,
          Every,
          Length,
          Offset,
          extraOptions,
        });
        crfValues[i] = crf;
      }
      i += 1;
    }
    console.log(
      "Now that we finish all the test is time to start the encode\n"
    );
    const willYouChange = await askingConfirmation(
      "If you want to encode on the ssame resolutions you ran the crf test press [y] or [Y] if not press another letter or key\n"
    );
    const vspipeLocation = path.join(currentFolder, `vsSetting.py`);
    const x264SettingLocation = path.join(currentFolder, `x264-setting.txt`);
    if (!willYouChange) {
      let i = 0;
      for (const resolution of Resolutions) {
        const confirm = await askingConfirmation(
          `Do you want to encode on ${resolution}\n Press [y] or [Y] if you do\n if you  don't press another letter or key\n`
        );

        if (confirm) {
          let vsPipe = fs.readFileSync(vspipeLocation, "utf8");
          vsPipe += `
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
clip.set_output()
`;
          fs.writeFileSync(`vs${resolution}Setting.py`, vsPipe);
          const x264SSetting = fs
            .readFileSync(x264SettingLocation, "utf8")
            .replace("encoded.mkv", `encoded${resolution}.mkv`)
            .replace("--ref", `--ref ${ref[i]}`)
            .trim();
          console.log(` . . . Encdoding ${resolution}\n`);
          await exec(
            `bin\\vspipe --y4m vs${resolution}Setting.py - | ${x264SSetting} --crf ${crfValues[i]} `
          );
        }
        i += 1;
      }
    } else {
      let i = 0;
      for (const crf of crfValues) {
        if (crf !== 0) {
          const resolution = Resolutions[i];
          let vsPipe = fs.readFileSync(vspipeLocation, "utf8");
          vsPipe += `
ratio = clip.width/clip.height
w = round(${resolution}*ratio/2)*2
clip = core.resize.Spline36(clip,width=w,height=${resolution})
clip.set_output()
`;
          fs.writeFileSync(`vs${resolution}Setting.py`, vsPipe);
          const x264SSetting = fs
            .readFileSync(x264SettingLocation, "utf8")
            .replace("encoded.mkv", `encoded${resolution}.mkv`)
            .replace("--ref", `--ref ${ref[i]}`)
            .trim();
          console.log(` . . . Encdoding ${resolution}\n`);
          await exec(
            `vspipe --y4m vs${resolution}Setting.py - | ${x264SSetting} --crf ${crf} `
          );
        }
        i += 1;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

main();
