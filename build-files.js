#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const CWD = process.cwd() + '/';
const NODE_MODULES_PATH = 'node_modules/markdown-it/'
const test_file = CWD + NODE_MODULES_PATH + 'MODIFYED';
const paragraph_file = CWD + NODE_MODULES_PATH + 'lib/rules_block/paragraph.js';
const newline_file = CWD + NODE_MODULES_PATH + 'lib/rules_inline/newline.js';

if (!fs.existsSync(test_file)) {
    fs.createWriteStream(test_file);
    let paragraph_text = fs.readFileSync(paragraph_file).toString();
    paragraph_text = paragraph_text.replace('.trim()', '');
    fs.writeFileSync(paragraph_file, paragraph_text);

    let newline_text = fs.readFileSync(newline_file).toString();
    newline_text = newline_text.replace(/while.*/, '');
    fs.writeFileSync(newline_file, newline_text);
}

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
