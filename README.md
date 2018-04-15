# 引言

mdoc 是一个使用能够快速显示 markdown、html、react、图片、pdf 的博客和文档框架。能够用来快速搭建静态博客和帮助文档工程。

## 安装
```sh
mkdir yourProject

cd yourProject

npm install git+https://github.com/remobile/mdoc.git --save

```

## 实例

参考 https://github.com/remobile/mdoc-example

建议将该工程 clone 下来然后修改。

然后执行 npm run mdoc -- -s

在浏览器中输入：http://localhost:4000/mdoc-example

## config.js 模板

```js
const markdownPlugins = require('./lib/markdownPlugins');

const config = {
    projectName: 'mdoc-example', // 工程名称，访问网站的时候会使用到：http://localhost:4000/mdoc-example
    title: '四面通物流大超市', // html 的 title
    favicon: 'img/favicon.ico', // html 的 favicon
    logo: 'img/logo.png', // logo
    colors: { // 颜色配置，在这里配置的颜色，在所有的css文件中使用 $primaryColor 来表示一个颜色即可 [可空]
        primaryColor: 'rgb(34, 34, 34)',
        secondaryColor: '#05A5D1',
        activeColor: '#FF4040',
        tintColor: '#005068',
    },
    highlight: { // 代码的风格 [可空]
        theme: 'solarized-dark',
    },
    markdownPlugins, // 基于 markdown-it 的用户自定义 [可空]
    documentPath: 'root', //默认为doc [可空]
    styles: [], // 整个工程的 style，全局有效 [可空]
    scripts: [], // 整个工程的 script，全局有效 [可空]
    footer: 'lib/Footer.js', //设置footer [可空]
    homePage: {  // 首页 （每个页面都可以配自己的styles和scripts）
        name: 'mdoc的用法',  // 标题
        path: 'index.md',  // 标题
    },
    menus: [ // 菜单，第一级会显示在顶部菜单栏，menus 包含多个 menu
        { // 第一个 menu，这个menu没有groups和pages，只显示一个页面
            name: '帮助',  // 标题及菜单名字
            mainPage: 'help.js', // 该菜单对应的首页
        },
        {  // 第二个 menu
            name: '示例',  // 标题及菜单名字
            mainPage: 'md/container.md', // 该菜单对应的首页
            groups: [ // groups 包含多个 group, 一个 group包含一个 name 和 多个页面，都会在左侧菜单中呈现
                {
                    name: '常用', // group的名称
                    pages: [ // 该group包含的页面
                        {
                            name: '简历', // 页面的名称及标题
                            path: 'common/resume.md', // 对应的路径
                            container: { // 该页面拥有一个自定义的container
                                dom: 'div', // default: div [可空]
                                props: { className: 'resumeContainer' }, // 该container的属性
                            }
                        },
                        {
                            name: 'README',
                            path: 'common/README.md',
                        },
                        {
                            name: '图片',
                            path: 'common/img.md',
                        },
                        {
                            name: 'button',
                            path: 'common/button.md',
                        },
                    ]
                },
                {
                    name: '插件',
                    pages: [
                        {
                            name: 'attrs',
                            path: 'md/attrs.md',
                        },
                        {
                            name: 'variable',
                            path: 'md/variable.md',
                        },
                        {
                            name: 'sequence',
                            path: 'md/sequence.md',
                            supports: ['sequence'], // 该页面支持 sequence，可用的有[sequence, chart, flow, math, tree]
                        },
                        {
                            name: 'chart',
                            path: 'md/chart.md',
                            supports: ['chart'],
                        },
                        {
                            name: 'flow',
                            path: 'md/flow.md',
                            supports: ['flow'],
                        },
                        {
                            name: 'emoji',
                            path: 'md/emoji.md',
                        },
                        {
                            name: 'tabbreak',
                            path: 'md/tabbreak.md',
                        },
                        {
                            name: 'footnote',
                            path: 'md/footnote.md',
                        },
                        {
                            name: 'container',
                            path: 'md/container.md',
                        },
                        {
                            name: '数学公式',
                            path: 'md/katex.md',
                            supports: ['math'],
                        },
                    ]
                },
            ],
        },
        {  // 第三个 menu
            name: '四面通',
            mainPage: 'smt/tuxiang.png',
            groups: [
                {
                    name: '快速了解',
                    pages: [
                        {
                            name: '概括',
                            path: 'smt/index.js',
                            styles: ['css/custom.css'],  // 该页面的style [可空]
                        },
                    ]
                },
                {
                    name: '公司风采',
                    pages: [
                        {
                            name: '公司面貌',
                            path: 'smt/tuxiang.png',
                        },
                        {
                            name: 'api文档',
                            path: 'smt/api.md',
                        },
                    ]
                },
                {
                    name: '招聘信息',
                    pages: [
                        {
                            name: '最新招聘',
                            path: 'smt/zhaopin.md',
                        },
                        {
                            name: '用户须知',
                            path: 'smt/user.html',
                        },
                        {
                            name: '说明',
                            path: 'smt/test.pdf',
                        },
                    ]
                },
            ],
        },
        {  // 第四个 menu item 没有 mainPage 和 groups， 但是拥有 pages，会以`下拉菜单`的方式，如果需要有树形目录的页面建议使用这种方式。
            name: 'API',
            pages: [
                {
                    name: 'pdshop',
                    path: 'api/pdshop.md',
                    supports: ['tree'], //是否支持树形结构
                },
                {
                    name: 'pdclient',
                    path: 'api/pdclient.md',
                    supports: ['tree'],
                },
            ],
        },
    ],
};

module.exports = config;
```

## 编译工程release

```sh
npm run mdoc -- -b
```

## 编译单个文件

参考conf中的各个文件，支持功能config中page的所有配置

```sh
npm run mdoc -- -f conf/chart.js
```

```js
module.exports = {
    name: 'chart', //名称
    path: 'md/chart.md', // 路径，跟目录为工程config的documentPath，该文件只能为.md和.js类型
    supports: ['jquery', 'chart'], //支持的功能,有 [main, code, jquery, _, tree, math, flow, sequence, chart] 其中main为main.css, _ 为 underscore
    dist: '1.html', //目标文件，可以为目录，如果为目录，文件名称为 chart.html
};
```

## 命名行

```sh
npm run mdoc -- -h
```

```
Usage: script [options]


  Options:

    -V, --version             output the version number
    -p, --port [4000]         port of server (default: 4000)
    -s, --start               start server for project
    -b, --build               build release for project
    -f, --file <config file>  build single file with config
    -h, --help                output usage information
```

## 文件路径

建议资源文件使用相对路径，如 `![美丽的小猫](img/cat.png)`, 不建议使用 `![美丽的小猫](/mdoc-example/img/cat.png)`，因为如果改变了 projectName 就需要做相应的修改.
超链接也建议使用相对路径：`这个可以链接到 [api](smt_api_md.html).`

## 音视频
```
#### 棕熊的世界：
![棕熊的世界](video/movie.mp4 "这是title信息"){width=450px height=250px autoplay controls}

#### 马长嘶：
![马长嘶](audio/horse.mp3){autoplay controls}
```
默认以`.mp4`和`.ogv`结尾的就是以video显示；以`.mp3`和`.ogv`结尾的就是以video显示。

也可以在config中设置：`{ videoRegExp: /\.(mp4|ogv)$/, audioRegExp: /\.(mp3|ogg)$/ }` 的配置来判断

还可以如下添加`video`和`audio`来强制显示video和audio
```
#### 棕熊的世界(强制音频)：
![棕熊的世界](video/movie.mp4 "这是title信息"){audio autoplay controls}

#### 马长嘶(强制视频)：
![马长嘶](audio/horse.mp3){video autoplay controls}
```

## 超链接

默认情况下，以`http(s):`开头的会在新窗口打开，其他的在本窗口打开。

在config中设置 `urlTarget: '_blank'`，都在新窗口打开；设置 `urlTarget: '_self'`，都在本窗口打开。

## 关联

- https://github.com/markdown-it/markdown-it
- https://reactjs.org/
