function execute(port) {
    const express = require('express');
    const React = require('react');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
    const fs = require('fs-extra');
    const glob = require('glob');
    const path = require('path');
    const color = require('color');
    const chalk = require('chalk');
    const mkdirp = require('mkdirp');
    const DocsLayout = require('../lib/DocsLayout.js');
    const ErrorPage = require('../lib/ErrorPage.js');
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
        !config.menus && ( config.menus = [] );
        const { highlight, homePage, menus } = config;
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        // 设置语法高亮
        if (highlight && highlight.hljs) {
            highlight.hljs(require('highlight.js'));
        }

        // 为每个 page 添加 id
        for (const menu of menus) {
            if (!menu.mainPage && menu.groups) {
                menu.mainPage = menu.groups[0].pages[0].path;
            }
            if (menu.mainPage) {
                menu.mainPageId = menu.mainPage.replace(/[/.]/g, '_');
                menu.id = menu.mainPageId;
                for (const group of (menu.groups||[])) {
                    for (const page of group.pages) {
                        if (!page.id) {
                            page.id = page.path.replace(/[/.]/g, '_');
                        }
                    }
                }
            } else {
                for (const page of menu.pages) {
                    if (!page.id) {
                        page.id = page.path.replace(/[/.]/g, '_');
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

        return config;
    }
    function writeFileWithPage(page, content) {
        const targetFile = path.join(buildDir, page.current.id+'.html');
        console.log('正在写文件：'+targetFile);
        fs.writeFileSync(targetFile, content);
    }
    function copyResourceFile(file) {
        let targetFile = path.join(buildDir, file);
        mkdirp.sync(path.dirname(targetFile));
        fs.copySync(getDocumentPath(file), targetFile);
    }
    function createFile(page) {
        const file =  getDocumentPath(page.current.path);
        if (!fs.existsSync(file)) {
            return writeFileWithPage(page,
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
            return writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        {rawContent}
                    </DocsLayout>
                )
            );
        } else if (extension === '.html') {
            const rawContent = fs.readFileSync(file, 'utf8');
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <div dangerouslySetInnerHTML={{ __html: rawContent }} />
                    </DocsLayout>
                )
            );
        } else if (extension === '.js') {
            const tempDir = __dirname + '/temp/';
            const tempFile = tempDir + page.current.path;
            mkdirp.sync(path.dirname(tempFile));
            fs.copySync(file, tempFile);

            removeModuleAndChildrenFromCache(tempFile);
            const ReactComp = require(tempFile);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <ReactComp />
                    </DocsLayout>
                )
            );
            fs.removeSync(tempDir);
        } else if (extension === '.pdf') {
            copyResourceFile(page.current.path);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <iframe src={`/simiantong/pdfjs/viewer.html?file=${config.baseUrl+page.current.path}`} width="80%" height="80%"></iframe>
                    </DocsLayout>
                )
            );
        } else if (extension.match(/^\.(png|jpg|jpeg|gif)$/)) {
            copyResourceFile(page.current.path);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <img src={config.baseUrl+page.current.path} />
                    </DocsLayout>
                )
            );
        } else {
            removeModuleAndChildrenFromCache('../lib/ErrorPage.js');
            const ErrorPage = require('../lib/ErrorPage.js');
            return writeFileWithPage(page,
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
    function writeStaticFile(file) {
        let targetFile = path.join(buildDir, file.split('/static/')[1] || '');
        // 替换css的颜色
        if (file.match(/\.css$/)) {
            let cssContent = fs.readFileSync(file, 'utf8');

            Object.keys(config.colors).forEach(key => {
                const color = config.colors[key];
                cssContent = cssContent.replace(new RegExp('\\$' + key, 'g'), color);
            });
            const codeColor = color(config.colors.primaryColor).alpha(0.07).string();
            cssContent = cssContent.replace(new RegExp('\\$codeColor', 'g'), codeColor);

            mkdirp.sync(path.dirname(targetFile));
            fs.writeFileSync(targetFile, cssContent);
        } else if (!fs.lstatSync(file).isDirectory()) {
            mkdirp.sync(path.dirname(targetFile));
            fs.copySync(file, targetFile);
        }
    }

    console.log('generate.js triggered...');
    const config = reloadSiteConfig();
    if (!config.colors || !config.colors.primaryColor || !config.colors.secondaryColor) {
        console.error(chalk.red('缺少颜色配置'));
        process.exit(0);
    }
    const buildDir = path.join(CWD, 'build', config.projectName);
    fs.removeSync(path.join(CWD, 'build'));
    mkdirp.sync(buildDir);

    // 创建首页
    createFile({ current: config.homePage, config });

    // 写各个页面
    for (const menu of config.menus) {
        if (!menu.groups && menu.mainPage) { // 如果菜单没有group的情况
            createFile({ current: { path: menu.mainPage, id: menu.mainPageId, name: menu.name, scripts: menu.scripts, styles: menu.styles },  menuId: menu.id, config });
        } else if (!menu.groups && menu.pages) { //下拉查单
            for (const i in menu.pages) {
                createFile({ pre: menu.pages[i-1], current: menu.pages[i], next: menu.pages[i*1+1], menuId: menu.id, config });
            }
        } else {
            for (const i in menu.groups) {
                const group = menu.groups[i];
                for (const j in group.pages) {
                    const pre = group.pages[j-1] || (i == 0 ? undefined : menu.groups[i-1].pages[menu.groups[i-1].pages.length-1]);
                    const next = group.pages[j*1+1] || (i == menu.groups.length-1 ? undefined : menu.groups[i*1+1].pages[0]);
                    createFile({ pre, current: group.pages[j], next, group, groups: menu.groups, menuId: menu.id, config });
                }
            }
        }
    }
    // 拷贝modc的static文件
    let files = glob.sync(path.join(__dirname, 'static', '**'));
    files.forEach(writeStaticFile);

    // 拷贝用户的static文件
    files = glob.sync(path.join(CWD, 'static', '**'));
    files.forEach(writeStaticFile);

}

module.exports = execute;
