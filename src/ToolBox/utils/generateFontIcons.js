const fantasticon = require("fantasticon");
const path = require("path");
const fs = require("fs");

const inputDirectory = path.join(process.cwd(), "src/Themes/icons");
const outputDirectory = path.join(process.cwd(), "public/icons");

if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);

fantasticon
  .generateFonts({
    name: "app-icons",
    prefix: "app-icon",
    inputDir: inputDirectory,
    outputDir: outputDirectory,
    fontTypes: [fantasticon.FontAssetType.WOFF2],
    assetTypes: [fantasticon.OtherAssetType.CSS],
  })
  .then((results) => {
    console.log("Font Icons Generated.");
  });
