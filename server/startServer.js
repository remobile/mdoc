function startServer(port, verbose) {
    const React = require('react');
    const express = require('express');
    const morgan = require('morgan');
    const crypto = require('crypto');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
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
        return CWD + config.documentPath + '/' + file;
    }
    function getPageId(path) {
        const hash = crypto.createHash('md5');
        hash.update(path);
        return hash.digest('hex');
    }
    function getPathFromReqPath(path) {
        return  decodeURI(path).replace(new RegExp(`^${config.baseUrl}`), '');
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + 'config.js');
        const config = require(CWD + 'config.js');
        !config.menus && ( config.menus = [] );
        const { homePage, menus } = config;

        // 设置 documentPath
        config.documentPath = (config.documentPath || 'doc').replace(/\/$/, '');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        // 为每个 page 添加 id
        for (const menu of menus) {
            if (!menu.mainPage && menu.groups) {
                menu.mainPage = menu.groups[0].pages[0].path;
            }
            if (menu.mainPage) {
                menu.mainPageId = getPageId(menu.mainPage);
                menu.id = menu.mainPageId;
                for (const group of (menu.groups||[])) {
                    for (const page of group.pages) {
                        if (!page.id) {
                            page.id = getPageId(page.path);
                        }
                    }
                }
            } else {
                for (const page of menu.pages) {
                    if (!page.id) {
                        page.id = getPageId(page.path);
                    }
                }
                menu.id = menu.pages[0].id;
            }
        }

        // 设置 homePage
        if (!homePage) {
            console.error(chalk.red('必须设置homePage'));
            process.exit(0);
        }
        config.homePage.id = 'index';

        if (verbose) {
            console.log("============== config start ==============");
            console.log(JSON.stringify(config, 0, 2));
            console.log("============== config end ==============");
        }

        return config;
    }
    function getPageById(id) {
        for (const menu of config.menus) {
            if (!menu.groups && menu.mainPage) { // 如果菜单没有group的情况
                if (menu.mainPageId === id) {
                    return { current: { path: menu.mainPage, id: menu.mainPageId, name: menu.name, scripts: menu.scripts, styles: menu.styles },  menuId: menu.id, config };
                }
            } else if (!menu.groups && menu.pages) { //下拉查单
                for (const i in menu.pages) {
                    const page = menu.pages[i];
                    if (page.id === id) {
                        return { pre: menu.pages[i-1], current: page, next: menu.pages[i*1+1], menuId: menu.id, config };
                    }
                }
            } else {
                for (const i in menu.groups) {
                    const group = menu.groups[i];
                    for (const j in group.pages) {
                        const page = group.pages[j];
                        if (page.id === id) {
                            const pre = group.pages[j-1] || (i == 0 ? undefined : menu.groups[i-1].pages[menu.groups[i-1].pages.length-1]);
                            const next = group.pages[j*1+1] || (i == menu.groups.length-1 ? undefined : menu.groups[i*1+1].pages[0]);
                            return { pre, current: page, next, group, groups: menu.groups, menuId: menu.id, config };
                        }
                    }
                }
            }
        }
        return null;
    };
    function renderFile(page, res) {
        removeModuleAndChildrenFromCache('../lib/DocsLayout.js');
        const DocsLayout = require('../lib/DocsLayout.js');
        const file =  getDocumentPath(page.current.path);
        verbose && console.log('render file: ', file);
        if (!fs.existsSync(file)) {
            removeModuleAndChildrenFromCache('../lib/ErrorPage.js');
            const ErrorPage = require('../lib/ErrorPage.js');
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <ErrorPage>
                            文件不存在
                        </ErrorPage>
                    </DocsLayout>
                )
            );
        }
        const extension = path.extname(file);
        if (extension === '.md') {
            const rawContent = fs.readFileSync(file, 'utf8');
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        {rawContent}
                    </DocsLayout>
                )
            );
        } else if (extension === '.html') {
            const rawContent = fs.readFileSync(file, 'utf8');
            res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <div dangerouslySetInnerHTML={{ __html: rawContent }} />
                    </DocsLayout>
                )
            );
        } else if (extension === '.js') {
            removeModuleAndChildrenFromCache(file);
            const ReactComp = require(file);
            res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <ReactComp />
                    </DocsLayout>
                )
            );
        } else if (extension === '.pdf') {
            res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <iframe src={`pdfjs/viewer.html?file=${config.baseUrl+page.current.path}`} width="80%" height="80%"></iframe>
                    </DocsLayout>
                )
            );
        } else if (extension.match(/^\.(png|jpg|jpeg|gif)$/)) {
            res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <img src={page.current.path} />
                    </DocsLayout>
                )
            );
        } else {
            removeModuleAndChildrenFromCache('../lib/ErrorPage.js');
            const ErrorPage = require('../lib/ErrorPage.js');
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <ErrorPage>
                            { extension + '的类型的文档不支持显示' }
                        </ErrorPage>
                    </DocsLayout>
                )
            );
        }
    }

    const config = reloadSiteConfig();
    if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
        console.error(chalk.red('缺少颜色配置'));
        process.exit(0);
    }
    const app = express();
    verbose && app.use(morgan('short'));

    // generate the main.css file by concatenating user provided css to the end
    app.get(/.*\.css$/, (req, res, next) => {
        let cssPath = __dirname + '/static/' + getPathFromReqPath(req.path);
        if (!fs.existsSync(cssPath)) {
            cssPath = CWD + 'static/' + getPathFromReqPath(req.path);
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

    app.get(/.*\.html$/, (req, res, next) => {
        const id = getPathFromReqPath(req.path).replace(/\.html$/, '');
        const page = getPageById(id);
        if (!page) {
            return next();
        }
        renderFile(page, res);
    });
    app.get(/.*\.pdf$/, (req, res, next) => {
        const file = getDocumentPath(getPathFromReqPath(req.path));
        res.sendFile(file);
    });
    app.get(/.*\.(png|jpg|jpeg|gif)$/, (req, res, next) => {
        const file = getDocumentPath(getPathFromReqPath(req.path));
        res.sendFile(file);
    });
    app.get('*', (req, res) => {
        if (/^(index\.html)?$/.test(getPathFromReqPath(req.path))) {
            const page = { current: config.homePage, config };
            renderFile(page, res);
        } else {
            res.sendStatus(404);
        }
    });

    const server = app.listen(port);
    server.on('listening', function () {
        const url = 'http://localhost:' + port + config.baseUrl;
        console.log('Open', url);
        const gulp = require('gulp');
        const browserSync = require('browser-sync').create();
        gulp.task('browser', function() {
            browserSync.init({
                proxy: url,
                files: [CWD + config.documentPath],
                notify: false,
            });
        });
        gulp.task('server', function() {
            gulp.watch([CWD+'lib/*.js', __dirname+'/../**/*.js', __dirname+'/../**/*.css'], function(item) {
                removeModuleAndChildrenFromCache(item.path);
                browserSync.reload();
            });
        });
        gulp.start(['browser', 'server']);
    });
    server.on('error', function (err) {
        startServer(port+1);
    });
}

module.exports = startServer;
