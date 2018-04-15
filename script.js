#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
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
    only: [__dirname, process.cwd()],
    presets: ['react'],
});


program
.version('0.0.1')
.option('-p, --port [4000]', 'port of server', 4000)
.option('-s, --start', 'start server for project')
.option('-v, --verbose', 'verbose mode')
.option('-b, --build', 'build release for project')
.option('-f, --file <config file>', 'build single file with config')
.parse(process.argv);

const { port, start, build, file, verbose } = program;

if (file) {
    const buildFile = require('./server/buildFile.js');
    buildFile(file);
} else if (build) {
    const buildProject = require('./server/buildProject.js');
    buildProject();
} else {
    const startServer = require('./server/startServer.js');
    startServer(port*1, verbose);
}
