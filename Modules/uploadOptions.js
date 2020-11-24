const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const uploadPtpimg = async (picture, key) => {
  try {
    console.log(picture);
    console.log(key);
    const { stdout } = await exec(`ptpimg_uploader -k ${key} -b "${picture}"`);

    return stdout;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const uploadImgur = async (image) => {
  try {
    let formData = new FormData();
    console.log(image);
    formData.append("image", fs.createReadStream(image));

    var config = {
      method: "post",
      url: "https://api.imgur.com/3/image",
      headers: {
        Authorization: "Client-ID 4c609b6817d7b43",
        ...formData.getHeaders(),
      },
      data: formData,
    };

    const info = await axios(config);
    return info.data.data.link;
  } catch (err) {
    return "";
  }
};

const toUploadimg = async (folder, pictures, apikey, site) => {
  let uploadedPicture = [];
  for (const picture of pictures) {
    const input = path.join(folder, picture);
    let uploadedImgurl = "";
    if (site.match(/ptpimg.me/)) {
      do {
        uploadedImgurl = await uploadPtpimg(input, apikey);

        if (uploadedImgurl === "") {
          console.log("An error ocurred, waiting 2 seconds before retrying");
          await new Promise((r) => setTimeout(r, 2000));
        }
      } while (uploadedImgurl === "");
    } else {
      do {
        uploadedImgurl = await uploadImgur(input);
        if (uploadedImgurl === "") {
          console.log("An error ocurred, waiting 2 seconds before retrying");
          await new Promise((r) => setTimeout(r, 2000));
        }
      } while (uploadedImgurl === "");
    }
    uploadedPicture = [...uploadedPicture, uploadedImgurl];
  }
  console.log(uploadedPicture);
  return uploadedPicture;
};

module.exports = { toUploadimg };
