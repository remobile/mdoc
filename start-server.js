require('babel-register')({
    babelrc: false,
    only: [__dirname, process.cwd() + '/lib'],
    presets: ['react'],
});

// For verifying port usage
const tcpPortUsed = require('tcp-port-used');

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

const program = require('commander');

program.option('--port <number>', 'Specify port number').parse(process.argv);

const port = parseInt(program.port, 10) || 4000;

tcpPortUsed
.check(port, 'localhost')
.then(function(inUse) {
    if (inUse) {
        console.error(chalk.red('Port ' + port + ' is in use'));
        process.exit(1);
    } else {
        console.log('Starting Docusaurus server on port ' + port + '...');
        // start local server on specified port
        const server = require('./server/server.js');
        server(port);
    }
})
.catch(function(ex) {
    setTimeout(function() {
        throw ex;
    }, 0);
});
