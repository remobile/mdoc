#!/usr/bin/env node

const tcpPortUsed = require('tcp-port-used');
const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const CWD = process.cwd() + '/';

if (!fs.existsSync(CWD + 'config.js')) {
    console.error(chalk.red('Error: 缺少配置文件'));
    process.exit(1);
}
const config = require(CWD + 'config.js');

require('babel-register')({
    babelrc: false,
    only: config.footer ? [__dirname, CWD + config.footer] : [__dirname],
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
