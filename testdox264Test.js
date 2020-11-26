const {
  askingVideo,
  closeQuestionInterface,
} = require("./Modules/questionsInterfaces.js");
const { dox264Tests } = require("./Modules/dox264Tests.js");
const main = async () => {
  try {
    const video = await askingVideo("Enter video lol \n");

    await dox264Tests({
      video,
      extraOptions: "",
      fps: 24,
      resolution: 1080,
      isAnime: true,
      isPtp: true,
    });
    closeQuestionInterface();
  } catch (err) {
    console.log(err);
  }
};
main();
