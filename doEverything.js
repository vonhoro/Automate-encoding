const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");
const process = require("process");
const readline = require("readline");
const crypto = require("crypto");
const jobId = crypto.randomBytes(4).toString("hex");
let counter = 0;
let cropTries = 1;
const currentFolder = process.cwd();

// Modules    

const { getVideoInfo } = require("./Modules/getVideoInfo.js");
const { createScreenshots } = require("./Modules/createScreenshots.js");
const { testCRF } = require("./Modules/testCRF.js");
const { testVideo } = require("./Modules/testVideo.js");
const { testx264Setting } = require("./Modules/testx264Setting.js");
const { x264Test } = require("./Modules/settings.js");

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const runTests = async (video, extraOptions) => {
  try {
    const firstx264Test = `bin\\x264 --demuxer y4m  --level 4.1 --no-mbtree --no-dct-decimate --preset veryslow --no-fast-pskip --keyint 240 --colormatrix bt709 --vbv-maxrate 50000 --vbv-bufsize 62500 --merange 32 --bframes 10 --deblock -3,-3 --qcomp 0.62 --aq-mode 3 --aq-strength 0.8 --psy-rd 1.1 --pass 1 --bitrate 8000 --output job${jobId}/ip-ratio/noip1.mkv -`;
    console.log(`Current Job is job${jobId}\n`);
    const sourcetFolder = path.join(currentFolder,`job${jobId}/source`)

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder,{recursive:true});
    }
    await createScreenshotsMetadata({
      video,
      outputFolder:sourceFolder,
      name: "source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
      resolutions: [1080],
      extraOptions,
    });

    //creates Screenshot to analzye from source

    await createScreenshots({
      video,
      outputFolder:sourceFolder,
      name: "source",
      positions: [10030, 20030, 30030, 40030, 50030, 60030, 70030],
      extraOptions,
    });
    const ipratioFolder = path.join(currentFolder,`job${jobId}/ip-ratio/screenshots`)
    if (!fs.existsSync(ipratioFolder)) {
      fs.mkdirSync(ipratioFolder,{recursive:true});
    }
      const sourceSsPath = path.join(sourceFolder,`screenshots`
    );
 
    copyScreenshots(sourceSsPath, ipratioFolder, "source");
    // analyze the screen shots from source

    await jimpAnalysis(sourceSsPath, "source");

    await testx264Setting({
      video,
      jobId,
      test: firstx264Test,
      testName: "noip1",
      testFolder: "ip-ratio",
      extraOptions,
    });

    let newVideo = firstx264Test
      .split(" ")
      .filter((setting) => setting.match(/.mkv$/))[0];
    let newVideoSrc = path.join(currentFolder, newVideo);
    newVideoSrc = getOSuri(newVideoSrc);
    newVideo = "noip1";
    for (const setting of x264Test) {
      let oldFolder;

      for (const test of setting.test) {
         let testFolder = path.join(currentFolder,`job${jobId}/${setting.name}`)
        if (!fs.existsSync(testFolder)) {
          fs.mkdirSync(`job${jobId}/${setting.name}`);
         
          fs.mkdirSync(path.join(testFolder,`screenshots`),{recursive:true});
          const sourceSsDestination = path.join(
            currentFolder,
            `job${jobId}/${setting.name}/screenshots`
          );
          copyScreenshots(sourceSsPath, sourceSsDestination, "source");
          testFolder = path.join(currentFolder,`job${jobId}/${x264Test[counter - 1].name}`);
        } 
        await createScreenshots({
          video: newVideoSrc,
          outputFolder:testFolder,
          name: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
          extraOptions,
        });
        await createScreenshotsMetadata({
          video: newVideoSrc,
          outputFolder:testFolder,
          name: newVideo,
          positions: [30, 90, 150, 210, 270, 330, 390],
          resolutions: [1080],
          extraOptions,
        });

        const ssPath = path.join(
          currentFolder,
          `job${jobId}/${oldFolder}/screenshots`
        );
        await jimpAnalysis(ssPath, newVideo);
        const newData = await testVideo({
          currentFolder,
          video,
          jobId,
          test,
          name: setting.name,
          extraOptions,
        });
        newVideo = newData.newVideo;
        newVideoSrc = getOSuri(newData.newVideoSrc);
      }
      counter += 1;
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

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
    console.log(numberOfScreenshots);
    const { numberOfFrames } = await getVideoInfo(video);
    const positions = randomFrameDistribution(
      numberOfFrames,
      numberOfScreenshots
    );
    const cropOutput = path.join(currentFolder,`Crop preview/Take number - ${cropTries}`)
      if (!fs.existsSync(cropOutput)) {
      fs.mkdirSync(cropOutput,{recursive:true});
    }
    await createScreenshots({
      video,
      outputFolder:cropOutput,
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
      outputFolder:cropOutput,
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
    if (testX264Settings) {
      console.log(
        `Edit x264-setting.txt with the settings you want to use dont change the demuxer or the input "-"`
      );
    } else {
       
      const p2pTemplate = await askingConfirmation("Do you want to use p2p templated x264 settings y/n \n") 
       
      console.log(
        "We are going to start a large setting analisys, and it will take some time, if Your video has less than 100000frames this will be skipped\n"
      );
      if (numberOfFrames > 99999) {
        await runTests(video, extraOptions);
        console.log(
          `You can look at all the pictures, x264 logs, and alanysis of each test on job${jobId}\n`
        );

        console.log(
          `Edit x264-setting.txt with the settings you want to use dont change the demuxer or the input "-"\n`
        );
      } else {
        console.log(
          "The number of frames on the video is too low so test were not run\n"
        );
      }
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
        i += 1;
      }
    }
    console.log(
      "Now that we finish all the test is time to start the encode\n"
    );
    const willYouChange = await askingConfirmation(
      "If you want to encode on the ssame resolutions you ran the crf test press [y] or [Y] if not press another letter or key\n"
    );
    const vspipeLocation = path.join(currentFolder, `vsSetting.py`);
    const x264SettingLocation = path.join(currentFolder, `x264-setting.txt`);
    if (willYouChange) {
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
