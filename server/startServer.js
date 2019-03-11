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
    const babel = require("babel-core");
    const _ = require("lodash");
    const { support } = require("../lib/utils");
    const CWD = process.cwd() + '/';
    const { removeModuleAndChildrenFromCache } = require('../lib/utils');

    function showError(text) {
        console.error(chalk.red(text));
        process.exit(0);
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
    function showDirectoryMenus(menus, dir, node, isStatic) {
        fs.readdirSync(dir).forEach(file=>{
            const level = node.length;
            const fullPath = path.join(dir, file);
            const isDirectory = fs.statSync(fullPath).isDirectory();
            const name = /^[\d-]+$/.test(file) ? file : file.replace(/^\d*/, '');
            if (/^\./.test(name)) {
                return;
            }
            if (level === 0) { // 展示在 menus 上
                if(isDirectory) {
                    menus.push({ name, groups: [] });
                    showDirectoryMenus(menus, fullPath, [name], isStatic);
                } else {
                    showError('展示目录的层次有误');
                }
            } else if (level === 1) {
                if(isDirectory) { // 展示在 menu.groups 上
                    const menu = _.find(menus, o=>o.name === node[0]);
                    if (!menu) {
                        showError('展示目录的层次有误');
                    }
                    menu.groups.push({ name, pages: [] });
                    showDirectoryMenus(menus, fullPath, [...node, name], isStatic);
                } else {
                    showError('展示目录的层次有误');
                }
            } else if (level === 2) {
                if(isDirectory) { // 展示在 group.pages 上
                    if (!isStatic) {
                        showError('展示目录的层次有误');
                    }
                    const menu = _.find(menus, o=>o.name === node[0]);
                    if (!menu) {
                        showError('展示目录的层次有误');
                    }
                    const group = _.find(menu.groups, o=>o.name === node[1]);
                    if (!group) {
                        showError('展示目录的层次有误');
                    }
                    group.pages.push({ name, path: fullPath, supports: ['dir', 'viewer'] });
                } else {
                    if (isStatic) {
                        showError('展示目录的层次有误');
                    } else {
                        const menu = _.find(menus, o=>o.name === node[0]);
                        if (!menu) {
                            showError('展示目录的层次有误');
                        }
                        const group = _.find(menu.groups, o=>o.name === node[1]);
                        if (!group) {
                            showError('展示目录的层次有误');
                        }
                        group.pages.push({ name: name.replace(/\.[^.]*$/, ''), path: fullPath.replace(new RegExp(`^${config.documentPath}/`), '') });
                    }
                }
            }
        });
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + 'config.js');
        config = require(CWD + 'config.js');
        !config.menus && ( config.menus = [] );
        const { homePage, menus } = config;

        // 设置 documentPath
        config.documentPath = (config.documentPath || 'doc').replace(/\/$/, '');
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        // 如果需要展示目录文件，写展示目录文件的各个文件
        if (config.showDirectory) {
            const dir = path.join(config.showDirectory.static ? 'static' : config.documentPath, config.showDirectory.path);
            showDirectoryMenus(menus, dir, config.showDirectory.node || [], config.showDirectory.static);
        }
        // console.log(JSON.stringify(menus, 0, 2));
        // process.exit(0);
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

        if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
            console.error(chalk.red('缺少颜色配置'));
            process.exit(0);
        }
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
        const hasDir = support(page.current, 'dir');
        const file = hasDir ? page.current.path : getDocumentPath(page.current.path);
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
        if (hasDir) {
            const { current } = page;
            const list = [];
            fs.readdirSync(current.path).forEach(file=>{
                const fullPath = path.join(current.path, file);
                const isDirectory = fs.statSync(fullPath).isDirectory();
                if (/^\./.test(file) || isDirectory) {
                    return;
                }
                const extname = path.extname(file);
                const name = (/^[\d-]+$/.test(file) ? file : file.replace(/^\d*/, '')).replace(extname, '');
                list.push({
                    name,
                    extname,
                    url: fullPath.replace(/^static\//, ''),
                });
            });
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        {list}
                    </DocsLayout>
                )
            );
        }
        const extension = path.extname(file);
        if (extension === '.md') {
            const rawContent = fs.readFileSync(file, 'utf8');
            const lines = rawContent.split(/\r?\n/);
            let i = 1;
            if (/^::: invisible\s*/.test(lines[0])) {
                for (let i = 1, len = lines.length - 1; i < len; ++i) {
                    if (/^:::\s*$/.test(lines[i])) {
                        break;
                    }
                }
            }
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        {lines.slice(i + 1).join('\n')}
                    </DocsLayout>
                )
            );
        } else if (extension === '.html') {
            const rawContent = fs.readFileSync(file, 'utf8');
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <div dangerouslySetInnerHTML={{ __html: rawContent }} />
                    </DocsLayout>
                )
            );
        } else if (extension === '.js') {
            const hasReact = support(page.current, 'react');
            if (hasReact) { // 动态网页
                const content = fs.readFileSync(file, 'utf8');
                const script = babel.transform(content, { plugins:['transform-react-jsx'], presets: ['es2015']}).code;
                return res.send(
                    renderToStaticMarkup(
                        <DocsLayout page={page}>
                            <div id="mdoc_react_root" />
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `
                                    ${script.replace('module.exports', 'var __mdoc_react_export')}
                                    ReactDOM.render(__mdoc_react_export, document.getElementById("mdoc_react_root"));
                                    `,
                                }}
                                />
                        </DocsLayout>
                    )
                );
            } else {
                removeModuleAndChildrenFromCache(file);
                const ReactComp = require(file);
                return res.send(
                    renderToStaticMarkup(
                        <DocsLayout page={page}>
                            <ReactComp />
                        </DocsLayout>
                    )
                );
            }
        } else if (extension === '.pdf') {
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <iframe src={`pdfjs/viewer.html?file=${config.baseUrl+page.current.path}`} width="80%" height="80%"></iframe>
                    </DocsLayout>
                )
            );
        } else if (extension.match(/^\.(png|jpg|jpeg|gif)$/)) {
            if (!page.current.supports) {
                page.current.supports = ['viewer'];
            } else if (page.current.supports.indexOf('viewer') < 0) {
                page.current.supports.push('viewer');
            }
            return res.send(
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <div id="mdoc_image_container">
                            <img src={page.current.path} style={{visibility:'hidden'}} />
                        </div>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                $(document).ready(function(){
                                    var viewer = new Viewer(document.getElementById("mdoc_image_container"), {
                                        inline:true,
                                        navbar:false,
                                        toolbar: false
                                    })})
                                    `,
                                }
                            }
                            />
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

    let config;
    reloadSiteConfig();

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
            gulp.watch([CWD+'config.js'], function(item) {
                reloadSiteConfig();
                browserSync.reload();
            });
        });
        gulp.start(['browser', 'server', 'config']);
    });
    server.on('error', function (err) {
        console.log("open error on port:", port);
        startServer(port+1);
    });
}

module.exports = startServer;
