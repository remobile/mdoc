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

    function showError(...text) {
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
    function showDirectoryMenus(parents, index, level) {
        const item = parents[index];
        const dir = path.join(item.static ? 'static' : config.documentPath, item.folder);
        const isDirectory = fs.statSync(dir).isDirectory();
        if (level === 2 && !item.expand) { // page层
            Object.assign(item, {
                path: item.folder,
                folder: dir,
                origin: item.origin,
                supports: [ isDirectory ? 'dir' : '', 'viewer'],
            });
            return 0;
        }
        if (!isDirectory) {
            showError(`${dir}应该为文件夹`);
        }
        const files = fs.readdirSync(dir).filter(o=>!/^\./.test(o));
        if (!files.length) {
            showError(`${dir}不能为空文件夹`);
        }
        if (level === 2) {
            parents.splice(index, 1, ...(files.map(o=>({
                name: o,
                path: path.join(item.folder, o),
                folder: path.join(dir, o),
                origin: item.origin,
                supports: [ fs.statSync(path.join(dir, o)).isDirectory() ? 'dir' : '', 'viewer'],
            }))));
        } else if (level === 0) { // menu层
            if (!item.expand) {
                item.groups = files.map(o=>({
                    name: o,
                    static: item.static,
                    origin: item.origin,
                    folder: path.join(item.folder, o),
                }));
                for (let i in item.groups) {
                    showDirectoryMenus(item.groups, i, 1);
                }
            } else {
                const memus = files.map(o=>({
                    name: o,
                    static: item.static,
                    origin: item.origin,
                    folder: path.join(item.folder, o),
                }));
                for (let i in memus) {
                    showDirectoryMenus(memus, i, 0);
                }
                parents.splice(index, 1, ...memus);
            }
        } else if (level === 1) { // group层
            if (!item.expand) {
                item.pages = files.map(o=>({
                    name: o,
                    path: path.join(item.folder, o),
                    folder: path.join(dir, o),
                    origin: item.origin,
                    supports: [ fs.statSync(path.join(dir, o)).isDirectory() ? 'dir' : '', 'viewer'],
                }));
            } else {
                const groups = files.map(o=>({
                    name: o,
                    static: item.static,
                    origin: item.origin,
                    folder: path.join(item.folder, o),
                }));
                for (let i in groups) {
                    showDirectoryMenus(groups, i, 1);
                }
                parents.splice(index, 1, ...groups);
            }
        }
        return item.expand && files.length ? files.length-1 : 0;
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

        // 检测各个文件时候存在，同时展开文件夹
        for (let i = 0; menus[i] !== undefined; i++) {
            const menu = menus[i];
            if (menu.folder) {
                i += showDirectoryMenus(menus, i, 0);
            } else {
                const groups = menu.groups;
                if (groups) {
                    for (let j = 0; groups[j] !== undefined; j++) {
                        const group = groups[j];
                        if (group.folder) {
                            j += showDirectoryMenus(groups, j, 1);
                        } else {
                            const pages = group.pages;
                            for (let k = 0; pages[k] !== undefined; k++) {
                                const page = pages[k];
                                if (page.folder) {
                                    k += showDirectoryMenus(pages, k, 2);
                                }
                            }
                        }
                    }
                }
            }
        }

        // 为每个 page 添加 id
        for (const menu of menus) {
            if (!menu.mainPage) {
                menu.mainPage = menu.groups && menu.groups[0] && menu.groups[0].pages && menu.groups[0].pages[0] && menu.groups[0].pages[0].path;
            }
            if (!menu.name) {
                if (menu.groups && menu.groups[0]) {
                    menu.name = menu.groups[0].name;
                } else if (menu.pages && menu.pages[0]) {
                    menu.name = menu.pages[0].name;
                } else {
                    menu.name = '未定义';
                }
            }
            if (menu.mainPage) {
                menu.mainPageId = getPageId(menu.mainPage);
                menu.id = menu.mainPageId;
                for (const group of (menu.groups||[])) {
                    if (!group.name) {
                        group.name = group.pages && group.pages[0] && group.pages[0].name || '未定义';
                    }
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
        const file = hasDir ? path.join(CWD, page.current.folder) : getDocumentPath(page.current.path);
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
            fs.readdirSync(current.folder).forEach(file=>{
                const fullPath = path.join(current.folder, file);
                const url = path.join(current.path, file);
                const isDirectory = fs.statSync(fullPath).isDirectory();
                if (/^\./.test(file) || isDirectory) {
                    return;
                }
                const extname = path.extname(file);
                const name = (/^[\d-]+$/.test(file) ? file : file.replace(/^\d*/, '')).replace(extname, '');
                list.push({
                    name,
                    extname,
                    url,
                    origin: current.origin ? `${current.origin.replace(/\/$/, '')}/${fullPath}` : '',
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
            const hasUntree = support(page.current, 'untree');
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
            } else if (hasUntree) { // 处理js文件显示js文件
                const rawContent = fs.readFileSync(file, 'utf8');
                return writeFileWithPage(page,
                    renderToStaticMarkup(
                        <DocsLayout page={page}>
                            { '``` untree json\n' + rawContent + '\n```' }
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

    // 创建domain的文件CNAME
    if (config.domain) {
        fs.writeFileSync(path.join(buildDir, 'CNAME'), config.domain);
    }
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
