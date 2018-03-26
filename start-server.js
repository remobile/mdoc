#!/usr/bin/env node

const tcpPortUsed = require('tcp-port-used');
const program = require('commander');
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

program.option('--port <number>', 'Specify port number').parse(process.argv);

const port = parseInt(program.port, 10) || 4000;

tcpPortUsed
.check(port, 'localhost')
.then(function(inUse) {
    if (inUse) {
        console.error(chalk.red('Port ' + port + ' is in use'));
        process.exit(1);
    } else {
        console.log('Starting mdoc server on port ' + port + '...');
        const server = require('./server/server.js');
        server(port);
    }
})
.catch(function(ex) {
    setTimeout(function() {
        throw ex;
    }, 0);
});
