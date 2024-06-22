var cheerio = require('cheerio');
const fs = require('fs');
const argv = process.argv.slice(2);

if (argv.length > 0 && fs.existsSync(argv[0])) {
  console.log(argv);
  const $ = cheerio.load(fs.readFileSync(argv[0]));

  // Remove script tags
  $("script").remove();

  // Remove links as script
  $("link[as='script']").remove();

  // Remove comments
  $("*").filter(function (index, node) {
    return node.type == "comment";
  }).remove();

  // Write out the modified html
  fs.writeFileSync(argv[0], $.html())
}
