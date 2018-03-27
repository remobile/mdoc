function buildMarkdown(file) {
    const React = require('react');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
    const fs = require('fs-extra');
    const path = require('path');
    const chalk = require('chalk');
    const MarkdownBlock = require('../lib/MarkdownBlock.js');
    const CWD = process.cwd() + '/';

    file = /^\//.test(file) ? file : path.resolve(CWD, file);
    if (!fs.existsSync(file)) {
        console.error(chalk.red('文件:'+file+'不存在'));
        process.exit(0);
    }
    const rawContent = fs.readFileSync(file, 'utf8');

    file = file.replace(/\.md$/, '.html');
    console.log('path:', file);
    return fs.writeFileSync(file,
        `
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width" />
            </head>
            <body>
            ${
                renderToStaticMarkup(
                    <MarkdownBlock>
                        {rawContent}
                    </MarkdownBlock>
                )
            }
            </body>
        </html>
        `
    );
}

module.exports = buildMarkdown;
