const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const process = require("process");
const currentFolder = process.cwd();

const encode = async (video) => {
  try {
    const x264Setting = fs.readFileSync("./x264 Setting.txt", "utf8");
    const { stdout, stderr } = await exec(
      `bin\\vspipe "bin\\vspipe final setting.py" --y4m - | "${x264Setting}"`
    );

    console.log(a);
  } catch (err) {
    console.log(err);
  }
};
encode("a");
