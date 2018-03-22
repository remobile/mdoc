#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const CWD = process.cwd() + '/';

if (!fs.existsSync(CWD + 'config.js')) {
    console.error(chalk.red('Error: 缺少配置文件'));
    process.exit(1);
}

require('babel-register')({
    babelrc: false,
    presets: ['react'],
});

const generate = require('./server/generate.js');
generate();
console.log("Site built successfully. Generated files in 'build' folder.");
