function buildMarkdown(port, configPath, build) {
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
        removeModuleAndChildrenFromCache(CWD + 'config.js');
        config = require(CWD + 'config.js');
        // 设置 documentPath
        config.documentPath = (config.documentPath || 'doc').replace(/\/$/, '');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
            console.error(chalk.red('缺少颜色配置'));
            process.exit(0);
        }
    }
    function reloadPage() {
        removeModuleAndChildrenFromCache(path.resolve(CWD, configPath));
        page = require(path.resolve(CWD, configPath));
        file =  getDocumentPath(page.path);
        if (!fs.existsSync(file)) {
            console.error(chalk.red('文件:'+file+'不存在'));
            process.exit(0);
        }
        page.dist = page.dist || '';
        if (path.extname(page.dist) === '.html') {
            distFile = path.join(CWD, page.dist);
        } else {
            distFile = path.join(CWD, page.dist, path.basename(file).replace(/\.(md|js)$/, '.html'));
        }
        fs.removeSync(distFile);
        mkdirp.sync(path.dirname(distFile));
    }

    let config;
    let page;
    let file;
    let distFile;
    reloadSiteConfig();
    reloadPage();

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
        removeModuleAndChildrenFromCache('../lib/SingleDocLayout.js');
        const SingleDocLayout = require('../lib/SingleDocLayout.js');
        let ReactComp, rawContent;
        if (path.extname(file) === '.md') {
            rawContent = fs.readFileSync(file, 'utf8');
        } else {
            removeModuleAndChildrenFromCache(file);
            ReactComp = require(file);
        }
        console.log(page);
        return res.send(
            renderToStaticMarkup(
                <SingleDocLayout page={{current: page, config}}>
                    { rawContent || <ReactComp /> }
                </SingleDocLayout>
            )
        );
    });
    app.get(/.*\.(png|jpg|jpeg|gif)$/, (req, res, next) => {
        const file = getDocumentPath(req.path.toString());
        res.sendFile(file);
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
                    fs.writeFileSync(distFile, html);

                    console.log('output:', distFile);
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
                    files: [file],
                    notify: false,
                    open: true,
                });
            });
            gulp.task('server', function() {
                gulp.watch([CWD+'lib/*.js', __dirname+'/**/*.js', __dirname+'/**/*.css'], function(item) {
                    removeModuleAndChildrenFromCache(item.path);
                    browserSync.reload();
                });
            });
            gulp.task('config', function() {
                gulp.watch([path.resolve(CWD, configPath)], function(item) {
                    reloadPage();
                    browserSync.reload();
                });
            });
            gulp.start(['browser', 'server', 'config']);
        }
    });
    server.on('error', function (err) {
        buildMarkdown(port+1, configPath, build);
    });
}

module.exports = buildMarkdown;
