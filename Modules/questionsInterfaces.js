const { getOSuri } = require("./utils.js");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const askingConfirmation = (msg) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (confirm) => {
      if (confirm.match(/^y$/i)) resolve(true);
      resolve(false);
    })
  );
};

const askingInteger = (msg) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (number) => {
      if (number.match(/^\d+$/)) resolve(parseInt(number));
      if (number.match(/^-\d+$/))
        resolve(-1 * parseInt(number.replace("-", "")));

      resolve(0);
    })
  );
};

const askingVideo = (msg) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (videoLink) => {
      const video = getOSuri(videoLink);
      resolve(video);
    })
  );
};
const askingNaturalNumber = (msg, defaultNumber) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (number) => {
      if (number.match(/^\d+$/)) resolve(parseInt(number));
      resolve(defaultNumber);
    })
  );
};
const askingText = (msg) => {
  return new Promise((resolve, reject) =>
    rl.question(msg, async (text) => {
      resolve(text);
    })
  );
};

const closeQuestionInterface = () => rl.close();

module.exports = {
  askingConfirmation,
  askingInteger,
  askingVideo,
  askingNaturalNumber,
  askingText,
  closeQuestionInterface,
};
