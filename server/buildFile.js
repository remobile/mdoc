function buildMarkdown(configPath) {
    const React = require('react');
    const express = require('express');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
    const mkdirp = require('mkdirp');
    const fs = require('fs-extra');
    const path = require('path');
    const chalk = require('chalk');
    const SingleDocLayout = require('../lib/SingleDocLayout');
    const CWD = process.cwd() + '/';

    // remove a module and child modules from require cache, so server does not have
    // to be restarted
    function removeModuleAndChildrenFromCache(moduleName) {
        let mod = require.resolve(moduleName);
        if (mod && (mod = require.cache[mod])) {
            mod.children.forEach(child => {
                delete require.cache[child.id];
                removeModulePathFromCache(mod.id);
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
        return CWD + (config.documentPath || 'doc').replace(/\/$/, '') + '/' + file;
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + 'config.js');
        const config = require(CWD + 'config.js');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        return config;
    }

    const config = reloadSiteConfig();
    if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
        console.error(chalk.red('缺少颜色配置'));
        process.exit(0);
    }

    const page = require(path.resolve(CWD, configPath));
    const file =  getDocumentPath(page.path);
    if (!fs.existsSync(file)) {
        console.error(chalk.red('文件:'+file+'不存在'));
        process.exit(0);
    }

    let distFile;
    page.dist = page.dist || '';
    if (path.extname(page.dist) === '.html') {
        distFile = path.join(CWD, page.dist);
    } else {
        distFile = path.join(CWD, page.dist, path.basename(file).replace(/\.(md|js)$/, '.html'));
    }
    fs.removeSync(distFile);
    mkdirp.sync(path.dirname(distFile));

    console.log('path:', distFile);

    const app = express();

    // generate the main.css file by concatenating user provided css to the end
    app.get(/.*\.css$/, (req, res) => {
        let cssPath = __dirname + '/static/' + req.path.toString().replace(config.baseUrl, '');
        if (!fs.existsSync(cssPath)) {
            cssPath = CWD + 'static/' + req.path.toString().replace(config.baseUrl, '');
            if (!fs.existsSync(cssPath)) {
                res.sendStatus(404);
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
    app.use(config.baseUrl, express.static(__dirname + '/static'));

    app.get(config.baseUrl, (req, res, next) => {
        let ReactComp, rawContent;
        if (path.extname(file) === '.md') {
            rawContent = fs.readFileSync(file, 'utf8');
        } else {
            ReactComp = require(file);
        }
        return res.send(
            renderToStaticMarkup(
                <SingleDocLayout page={{current: page, config}}>
                    { rawContent || <ReactComp /> }
                </SingleDocLayout>
            )
        );
    });
    app.get(/.*\.(png|jpg|jpeg|gif)$/, (req, res, next) => {
        const file = getDocumentPath(req.path.toString().replace(config.baseUrl, ''));
        res.sendFile(file);
    });
    app.get('*', (req, res) => {
        res.sendStatus(404);
    });

    let port = 4000;
    const server = app.listen(port);
    server.on('listening', function () {
        console.log('Open http://localhost:' + port + config.baseUrl);
    });
    server.on('error', function (err) {
        startServer(port+1);
    });
}

module.exports = buildMarkdown;
