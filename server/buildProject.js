function buildProject() {
    const React = require('react');
    const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
    const fs = require('fs-extra');
    const glob = require('glob');
    const crypto = require('crypto');
    const path = require('path');
    const color = require('color');
    const chalk = require('chalk');
    const mkdirp = require('mkdirp');
    const DocsLayout = require('../lib/DocsLayout');
    const ErrorPage = require('../lib/ErrorPage');
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
    function getPageId(path) {
        if (/^https?:/.test(path)) {
            const hash = crypto.createHash('md5');
            hash.update(path);
            return hash.digest('hex');
        }
        return path.replace(/[/.]/g, '_');
    }
    function reloadSiteConfig() {
        removeModuleAndChildrenFromCache(CWD + 'config.js');
        const config = require(CWD + 'config.js');
        !config.menus && ( config.menus = [] );
        const { homePage, menus } = config;

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

        return config;
    }
    function writeFileWithPage(page, content) {
        const targetFile = path.join(buildDir, page.current.id+'.html');
        console.log('正在写文件：'+targetFile);
        fs.writeFileSync(targetFile, content);
    }
    function copyResourceFile(file) {
        let targetFile = path.join(buildDir, file);
        console.log('正在拷贝文件：'+targetFile);
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
            removeModuleAndChildrenFromCache(file);
            const ReactComp = require(file);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <ReactComp />
                    </DocsLayout>
                )
            );
        } else if (extension === '.pdf') {
            copyResourceFile(page.current.path);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <iframe src={`pdfjs/viewer.html?file=${page.current.path}`} width="80%" height="80%"></iframe>
                    </DocsLayout>
                )
            );
        } else if (extension.match(/^\.(png|jpg|jpeg|gif)$/)) {
            copyResourceFile(page.current.path);
            writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <img src={page.current.path} />
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
        console.log('正在拷贝资源文件：'+targetFile);
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

    console.log('开始编译...');
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
    // 拷贝mdoc的static文件
    let files = glob.sync(path.join(__dirname, 'static', '**'));
    files.forEach(writeStaticFile);

    // 拷贝用户的static文件
    files = glob.sync(path.join(CWD, 'static', '**'));
    files.forEach(writeStaticFile);

    // 拷贝highlight的css文件
    const theme = config.highlight && config.highlight.theme || 'default';
    console.log('正在拷贝资源文件：'+path.join(buildDir, `${theme}.css`));
    fs.copySync(path.join(CWD, `node_modules/highlight.js/styles/${theme}.css`), path.join(buildDir, `${theme}.css`));

}

module.exports = buildProject;
