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

program
.version('0.0.1')
.option('-s, --start', 'start server for project')
.option('-b, --build []', 'build release for project or single file')
.option('-d, --hasDomain', 'if has domain')
.option('-f, --file <config file>', 'start server single file with config')
.option('-t, --ppt <config file>', 'start server single file with ppt')
.option('-e, --edit [ppt index file]', 'edit ppt file')
.option('-m, --mobile', 'is mppt file')
.option('-w, --word <config file>', 'crate word with config')
.option('-a, --artical <md file>', 'crate artical with md file, -b xx.html to build release')
.option('-p, --port [4000]', 'port of server', 4000)
.option('-o, --open', 'if open browser')
.option('-v, --verbose', 'verbose mode')
.parse(process.argv);

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

const { port, start, build, hasDomain, file, ppt, word, edit, mobile, artical, verbose, open } = program;
if (artical) {
    const startArtical = require('./server/startArtical.js');
    startArtical(artical, port*1, verbose, open, build);
} else if (word) {
    if (build) {
        const buildWord = require('./server/buildWord.js');
        buildWord(word);
    } else {
        const startWord = require('./server/startWord.js');
        startWord(word, port*1, verbose, open);
    }
} else {
    require('babel-register')({
        babelrc: false,
        ignore: function(filename) {
            if (/node_modules/.test(filename)) {
                if (new RegExp(__dirname).test(filename)) {
                    return false;
                }
                return true;
            }
            return false;
        },
        extensions: [".js"],
        presets: ['react'],
    });

    if (file) {
        const buildFile = require('./server/buildFile.js');
        buildFile(port*1, file, build);
    } else if (ppt) {
        const buildPPT = require('./server/buildPPT.js');
        buildPPT(port*1, ppt, build, edit, mobile, open);
    } else if (build) {
        const buildProject = require('./server/buildProject.js');
        buildProject(hasDomain, verbose);
    } else {
        const startServer = require('./server/startServer.js');
        startServer(port*1, verbose, open);
    }
}
