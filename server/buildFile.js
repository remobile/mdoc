function buildMarkdown(configPath) {
    const React = require('react');
    const request = require('superagent');
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
        const { highlight } = config;
        // 设置 baseUrl
        config.baseUrl = `/${config.projectName}/`;

        // 设置语法高亮
        if (highlight && highlight.hljs) {
            highlight.hljs(require('highlight.js'));
        }
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

    let ReactComp, rawContent;
    if (path.extname(file) === '.md') {
        rawContent = fs.readFileSync(file, 'utf8');
    } else {
        ReactComp = require(file);
    }

    return fs.writeFileSync(distFile,
        renderToStaticMarkup(
            <SingleDocLayout page={{current: page, config}}>
                { rawContent || <ReactComp /> }
            </SingleDocLayout>
        )
    );
}

module.exports = buildMarkdown;
