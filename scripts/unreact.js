var cheerio = require('cheerio');
const fs = require('fs');
const firstArg = process.argv.length > 1 ? process.argv[2] : null

if (firstArg && fs.existsSync(firstArg)) {
  const $ = cheerio.load(fs.readFileSync(firstArg));

  // Remove script tags
  $("script").remove();

  // Remove links as script
  $("link[as='script']").remove();

  // Write out the modified html
  fs.writeFileSync(firstArg, $.html())
}
