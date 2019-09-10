function buildProject(verbose) {
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
    const babel = require("babel-core");
    const _ = require("lodash");
    const { support, parseParams } = require("../lib/utils");
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
    function showDirectoryMenus(menus, dir, node, isStatic, origin) {
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
                    showDirectoryMenus(menus, fullPath, [name], isStatic, origin);
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
                    showDirectoryMenus(menus, fullPath, [...node, name], isStatic, origin);
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
                    group.pages.push({ name, path: fullPath, origin, supports: ['dir', 'viewer'] });
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
                        group.pages.push({
                            name: name.replace(/\.[^.]*$/, ''),
                            path: fullPath.replace(new RegExp(`^${config.documentPath}/`), ''),
                            origin,
                        });
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
        if (config.dirs) {
            for (const item of config.dirs) {
                const dir = path.join(item.static ? 'static' : config.documentPath, item.path);
                showDirectoryMenus(menus, dir, item.node || [], item.static, item.origin);
            }
        }

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
        const hasDir = support(page.current, 'dir');
        const file = hasDir ? path.join(CWD, page.current.path) : getDocumentPath(page.current.path);
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
                    origin: `${current.origin.replace(/\/$/, '')}/${fullPath}`,
                });
            });
            return writeFileWithPage(page,
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
            if (/^::: meta\s*/.test(lines[0])) {
                let i = 1;
                for (let len = lines.length - 1; i < len; ++i) {
                    if (/^:::\s*$/.test(lines[i])) {
                        break;
                    }
                }
                const params = parseParams(lines.slice(1, i).join(' '));
                page.current.supports = [ ...(page.current.supports || []), ...(params.supports || []) ];
                page.current.styles = [ ...(page.current.styles || []), ...(params.styles || []) ];
                page.current.scripts = [ ...(page.current.scripts || []), ...(params.scripts || []) ];
            }
            return writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        {rawContent}
                    </DocsLayout>
                )
            );
        } else if (extension === '.html') {
            const rawContent = fs.readFileSync(file, 'utf8');
            return writeFileWithPage(page,
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
                return writeFileWithPage(page,
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
                return writeFileWithPage(page,
                    renderToStaticMarkup(
                        <DocsLayout page={page}>
                            <ReactComp />
                        </DocsLayout>
                    )
                );
            }
        } else if (extension === '.pdf') {
            copyResourceFile(page.current.path);
            return writeFileWithPage(page,
                renderToStaticMarkup(
                    <DocsLayout page={page}>
                        <iframe src={`pdfjs/viewer.html?file=${config.baseUrl+page.current.path}`} width="80%" height="80%"></iframe>
                    </DocsLayout>
                )
            );
        } else if (extension.match(/^\.(png|jpg|jpeg|gif)$/)) {
            copyResourceFile(page.current.path);
            if (!page.current.supports) {
                page.current.supports = ['viewer'];
            } else if (page.current.supports.indexOf('viewer') < 0) {
                page.current.supports.push('viewer');
            }
            return writeFileWithPage(page,
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
    let config;
    reloadSiteConfig();

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
