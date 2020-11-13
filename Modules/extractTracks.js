const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const extractTracks = async (tracks, video, type, workFolder) => {
  try {
    console.log(`Extractring all ${type} tracks `);
    for (const track of tracks) {
      const output = path.join(
        workFolder,
        `${type}Tracks/track-${track.ID}.${track.Format}`
      );
      await exec(
        `mkvextract "${video}" tracks ${track.StreamOrder}:"${output}"`
      );
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = { extractTracks };
