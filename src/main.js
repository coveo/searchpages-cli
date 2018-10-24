const fs = require('fs');

const { createDefault, getConfig } = require('./config');
const deploy = require('./deploy');

let ARGS = {};

let parseArgs = () => {
  const args = process.argv.slice(2);

  while (args.length) {
    let arg = args.shift().trim();
    if (/^-+init$/.test(arg)) {
      ARGS.doInit = true;
    } else if (/^-/.test(arg)) {
      console.log('Do not understand this argument: ', arg);
    } else {
      ARGS.folder = arg;
    }
  }
};

parseArgs();
if (ARGS.doInit) {
  if (ARGS.folder) {
    console.log(`Create folder "${ARGS.folder}" and initialize page.`);
    createDefault(ARGS.folder);
  } else {
    console.log(`Missing folder name.`);
  }
} else {
  // validate FOLDER first
  if (!ARGS.folder) {
    ARGS.folder = '.';
  }
  if (!(fs.existsSync(ARGS.folder + '/page.html') && fs.existsSync(ARGS.folder + '/page.scss') && fs.existsSync(ARGS.folder + '/page.js'))) {
    console.log('Not a valid folder. Missing page.html, page.scss, or page.js.');
    process.exit();
  }
  //
  console.log(`Deploying search page from ${ARGS.folder}`);
  getConfig(ARGS.folder).then(config => {
    deploy(ARGS.folder, config);
  });
}
