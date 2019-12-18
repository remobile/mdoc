function buildMarkdown(port, configPath, build, index, mobile) {
    const React = require('react');
    const express = require('express');
    const inliner = require('inliner');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
    const mkdirp = require('mkdirp');
    const fs = require('fs-extra');
    const path = require('path');
    const color = require('color');
    const chalk = require('chalk');
    const _ = require('lodash');
    const CWD = process.cwd() + '/';
    const { removeModuleAndChildrenFromCache, formatStandardObject } = require('../lib/utils');
    index === true && (index = 0);
    function getDocumentPath(file) {
        return CWD + config.documentPath + '/' + file;
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + configPath);
        config = require(CWD + configPath);
        // 设置 documentPath
        config.documentPath = (config.documentPath || 'doc').replace(/\/$/, '');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;
        const pages = config.pages;
        if (!config.pages || !config.pages.length) {
            console.error(chalk.red('请设置页面'));
            process.exit(0);
        }
        if (path.extname(config.dist) === '.html') {
            distFile = path.join(CWD, config.dist);
        } else {
            distFile = path.join(CWD, config.dist, config.projectName, '.html');
        }
        fs.removeSync(distFile);
        mkdirp.sync(path.dirname(distFile));
    }

    let config;
    let file;
    let distFile;
    reloadSiteConfig();

    const app = express();
    const http = require('http').Server(app);

    // generate the main.css file by concatenating user provided css to the end
    app.get(/.*\.css$/, (req, res, next) => {
        let cssPath = __dirname + '/static/' + req.path.toString();
        if (!fs.existsSync(cssPath)) {
            cssPath = CWD + 'static/' + req.path.toString();
            if (!fs.existsSync(cssPath)) {
                return next();
            }
        }

        let cssContent = fs.readFileSync(cssPath, {encoding: 'utf8'});
        if (config.colors) {
            Object.keys(config.colors).forEach(key => {
                const color = config.colors[key];
                cssContent = cssContent.replace(new RegExp('\\$' + key, 'g'), color);
            });
            const codeColor = color(config.colors.primaryColor).alpha(0.07).string();
            cssContent = cssContent.replace(new RegExp('\\$codeColor', 'g'), codeColor);
        }
        res.send(cssContent);
    });

    // serve static assets from these locations
    app.use(config.baseUrl, express.static(CWD + 'static'));
    app.use(config.baseUrl, express.static(CWD + 'node_modules/highlight.js/styles'));
    app.use(config.baseUrl, express.static(__dirname + '/static'));
    app.use(config.baseUrl, express.static(__dirname + '/public'));

    app.get(config.baseUrl, (req, res, next) => {
        if (index === undefined) {
            const layout = mobile ? '../lib/MPPTLayout.js' : '../lib/PPTLayout.js';
            removeModuleAndChildrenFromCache(layout);
            const PPTLayout = require(layout);
            let ReactComp, rawContent;
            for (const page of config.pages) {
                const file = getDocumentPath(page.path);
                if (path.extname(file) === '.md') {
                    rawContent = fs.readFileSync(file, 'utf8');
                } else {
                    removeModuleAndChildrenFromCache(file);
                    ReactComp = require(file);
                }
                page.content = (rawContent || <ReactComp />);
                page.config = config;
            }
            // console.log(config);
            return res.send(
                renderToStaticMarkup(<PPTLayout config={config} />)
            );
        } else {
            const editLayout = mobile ? '../editor/MPPTEditLayout.js' : '../lib/PPTEditLayout.js';
            removeModuleAndChildrenFromCache(editLayout);
            const PPTEditLayout = require(editLayout);
            const page = config.pages[index];
            if (!page) {
                return res.send('错误的index');
            }
            const file = getDocumentPath(page.path);
            if (path.extname(file) !== '.md') {
                return res.send('对应的文件不能编辑');
            }
            page.content = fs.readFileSync(file, 'utf8');
            page.config = config;

            // console.log(config);
            return res.send(
                renderToStaticMarkup(<PPTEditLayout page={page} />)
            );
        }
    });
    app.post('/saveMarkdown', (req, res) => {
        let text = '';
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            fs.writeFileSync(getDocumentPath(config.pages[index].path), text, 'utf8');
            res.send('');
        });
    });
    app.post('/getPages', (req, res) => {
        req.on('data', function(chunk) {});
        req.on('end', function() {
            res.send(JSON.stringify({ pages: config.pages.map(o=>_.pick(o, name)), index }));
        });
    });
    app.post('/setPageIndex', (req, res) => {
        let text = '';
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            index = JSON.parse(text).pageIndex;
            res.send('');
        });
    });
    app.post('/copyPage', (req, res) => {
        let text = '';
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            removeModuleAndChildrenFromCache(CWD + configPath);
            const _config = require(CWD + configPath);
            let i = _config.pages.length;
            let page;
            while (i > index) {
                if (i === index + 1) {
                    page = _.clone(_config.pages[index]);
                    fs.copySync(getDocumentPath(`${i+1}.md`), getDocumentPath(`${i+2}.md`));
                } else {
                    page = _config.pages[i-1];
                    fs.moveSync(getDocumentPath(`${i+1}.md`), getDocumentPath(`${i+2}.md`));
                }
                page.name = `第${i+2}页`;
                page.path = `${i+2}.md`;
                _config.pages[i] = page;
            }
            fs.writeFileSync(CWD + configPath, 'module.exports = ' + formatStandardObject(_config));
            index = index + 1;
            reloadSiteConfig();
            res.send('');
        });
    });
    app.post('/deletePage', (req, res) => {
        let text = '';
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            removeModuleAndChildrenFromCache(CWD + configPath);
            const _config = require(CWD + configPath);
            const len = _config.pages.length - 1;
            let i = index;
            let page;
            while (i < len) {
                page = _config.pages[i+1];
                fs.moveSync(getDocumentPath(`${i+2}.md`), getDocumentPath(`${i+1}.md`), { overwrite: true });
                page.name = `第${i+1}页`;
                page.path = `${i+1}.md`;
                _config.pages[i] = page;
            }
            _config.pages.length = len;
            fs.writeFileSync(CWD + configPath, 'module.exports = ' + formatStandardObject(_config));
            index = index - 1;
            reloadSiteConfig();
            res.send('');
        });
    });
    app.post('/savePages', (req, res) => {
        let text = '';
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            const _index = JSON.parse(text).pageIndex;

            fs.copySync('/tmp/myfile', '/tmp/mynewfile')
            fs.writeFileSync(CWD + configPath, `module.exports = ${JSON.stringify(config.pages, null, 4)}`, 'utf8');
            res.send('');
        });
    });
    app.post('/getHistory', (req, res) => {
        const file = `.${config.projectName}_${index}_history.log`;
        req.on('data', function(chunk) {});
        req.on('end', function() {
            res.send(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
        });
    });
    app.post('/updateHistory', (req, res) => {
        let text = '';
        const file = `.${config.projectName}_${index}_history.log`;
        req.on('data', function(chunk) { text += chunk });
        req.on('end', function() {
            fs.writeFileSync(file, text, 'utf8');
            res.send('');
        });
    });
    app.get('*', (req, res) => {
        res.sendStatus(404);
    });

    const server = app.listen(port);
    server.on('listening', function () {
        const url = 'http://localhost:' + port + config.baseUrl;
        console.log('Open', url);
        if (build) {
            new inliner(url, { images: true }, function (error, html) {
                if (error) {
                    console.log(chalk.red(event));
                } else {
                    console.log('output:', distFile);
                    fs.writeFileSync(distFile, html);
                    process.exit(0);
                }
            })
            .on('progress', function (event) {
                console.log(chalk.green(event));
            });
        } else {
            const gulp = require('gulp');
            const browserSync = require('browser-sync').create();
            gulp.task('browser', function() {
                browserSync.init({
                    proxy: url,
                    files: [CWD + config.documentPath],
                    notify: false,
                    open: true,
                });
            });
            gulp.task('server', function() {
                gulp.watch([CWD+'lib/*.js', __dirname+'/../**/*.js', __dirname+'/../**/*.css'], function(item) {
                    removeModuleAndChildrenFromCache(item.path);
                    if (/\/mdoc\/markdown-it-plugins\//.test(item.path)) {
                        removeModuleAndChildrenFromCache(item.path.replace(/\/mdoc\/markdown-it-plugins\/.*/, '/mdoc/lib/MarkdownBlock.js'));
                    }
                    browserSync.reload();
                });
            });
            gulp.task('config', function() {
                gulp.watch([path.resolve(CWD, configPath)], function(item) {
                    reloadSiteConfig();
                    browserSync.reload();
                });
            });
            gulp.start(['browser', 'server', 'config']);
        }
    });
    server.on('error', function (err) {
        buildMarkdown(port+1, configPath, build, index, mobile);
    });
}

module.exports = buildMarkdown;
