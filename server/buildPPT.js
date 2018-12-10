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

    // remove a module and child modules from require cache, so server does not have
    // to be restarted
    function removeModuleAndChildrenFromCache(moduleName) {
        let mod = require.resolve(moduleName);
        if (mod && (mod = require.cache[mod])) {
            mod.children.forEach(child => {
                removeModulePathFromCache(child.id);
            });
            delete require.cache[mod.id];
            removeModulePathFromCache(mod.id);
        }
    }
    function removeModulePathFromCache(moduleName) {
        Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
            if (cacheKey.indexOf(moduleName) > 0) {
                delete module.constructor._pathCache[cacheKey];
            }
        });
    }
    function getDocumentPath(file) {
        return CWD + config.documentPath + '/' + file;
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + configPath);
        config = require(CWD + configPath);
        // 设置 documentPath
        config.documentPath = (config.documentPath || 'ppt').replace(/\/$/, '');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
            console.error(chalk.red('缺少颜色配置'));
            process.exit(0);
        }
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
        // removeModuleAndChildrenFromCache('../lib/PPTLayout.js');
        // const PPTLayout = require('../lib/PPTLayout.js');

        let html = '';
        for (const page of config.pages) {
            console.log("====", page);
            html += page.path;
        }
        return res.send(html);
    });
    app.get('*', (req, res) => {
        res.sendStatus(404);
    });

    const server = app.listen(port);
    server.on('listening', function () {
        const url = 'http://localhost:' + port + config.baseUrl;
        console.log('Open', url);
        if (build) {
            new inliner(url, { images: true}, function (error, html) {
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
                gulp.watch([CWD+'lib/*.js', __dirname+'/../**/*.js', __dirname+'/../**/*.css'], function(item) {
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
