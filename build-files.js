#!/usr/bin/env node

require('babel-register')({
  babelrc: false,
  only: [__dirname, process.cwd() + '/lib'],
  presets: ['react'],
});

// initial check that required files are present
const chalk = require('chalk');
const fs = require('fs');
const CWD = process.cwd();

if (!fs.existsSync(CWD + '/config.js')) {
  console.error(
    chalk.red('Error: No config.js file found in website folder!')
  );
  process.exit(1);
}

// generate all static html files
const generate = require('./server/generate.js');
generate();
console.log("Site built successfully. Generated files in 'build' folder.");
