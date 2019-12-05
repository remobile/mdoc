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
    const CWD = process.cwd() + '/';
    const { removeModuleAndChildrenFromCache } = require('../lib/utils');

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

        if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
            console.error(chalk.red('缺少颜色配置'));
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
        Object.keys(config.colors).forEach(key => {
            const color = config.colors[key];
            cssContent = cssContent.replace(new RegExp('\\$' + key, 'g'), color);
        });
        const codeColor = color(config.colors.primaryColor).alpha(0.07).string();
        cssContent = cssContent.replace(new RegExp('\\$codeColor', 'g'), codeColor);

        res.send(cssContent);
    });

    // serve static assets from these locations
    app.use(config.baseUrl, express.static(CWD + 'static'));
    app.use(config.baseUrl, express.static(CWD + 'node_modules/highlight.js/styles'));
    app.use(config.baseUrl, express.static(__dirname + '/static'));

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
            const editLayout = mobile ? '../lib/MPPTEditLayout.js' : '../lib/PPTEditLayout.js';
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
        // req.setEncoding('utf8');
        req.on('data', function(chunk) {
            text += chunk;
        });
        req.on('end', function() {
            fs.writeFileSync(getDocumentPath(config.pages[index].path), text, 'utf8');
            res.sendStatus(200);
        });
    });
    app.post('/getHistory', (req, res) => {
        let text = '';
        const file = `.${config.projectName}_${index}_history.log`;
        req.on('data', function(chunk) {
            text += chunk;
        });
        req.on('end', function() {
            res.send(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
        });
    });
    app.post('/updateHistory', (req, res) => {
        let text = '';
        const file = `.${config.projectName}_${index}_history.log`;
        req.on('data', function(chunk) {
            text += chunk;
        });
        req.on('end', function() {
            fs.writeFileSync(file, text, 'utf8');
            res.sendStatus(200);
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
        buildMarkdown(port+1, configPath, build, index);
    });
}

module.exports = buildMarkdown;
