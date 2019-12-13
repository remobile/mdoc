const React = require('react');
const MarkdownView = require('../lib/MarkdownView');
const { support } = require('../lib/utils');
const PropertyPanel = require('./PropertyPanel');
const AnimatePanel = require('./AnimatePanel');

class PPTEditLayout extends React.Component {
    render() {
        const { page } = this.props;
        page.edit = true;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="layui/css/layui.css" />
                    <link rel="stylesheet" href="animate/css/animate.css" />
                    <link rel="stylesheet" href="mppt/panel.css" />
                    <link rel="stylesheet" href="mppt/editor.css" />
                    <link rel="stylesheet" href="mppt/control.css" />
                    <link rel="stylesheet" href="mppt/component.css" />
                    <link rel="stylesheet" href="mppt/history.css" />
                </head>
                <body>
                    <div id="prop">
                        <div className="layui-tab layui-tab-brief">
                            <ul className="layui-tab-title">
                                <li className="layui-this">属性</li>
                                <li>动画</li>
                            </ul>
                            <div className="layui-tab-content">
                                <div className="layui-tab-item layui-show">
                                    <PropertyPanel />
                                </div>
                                <div className="layui-tab-item">
                                    <AnimatePanel />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="phone"></div>
                    <div id="editor">
                        <MarkdownView source={page.content} page={page} container={null} />
                    </div>
                    <div id="component">
                        <div className="title">组件列表</div>
                        <div id="componentContent"></div>
                        <div id="componentBottom">
                            <div className="layui-btn-group">
                                <button id="componentButtonText" title="新建文本(alt+t)" type="button" className="layui-btn layui-btn-sm tip">
                                    <i className="layui-icon">&#xe63c;</i>
                                </button>
                                <button id="componentButtonImage" title="新建图片(alt+m)" type="button" className="layui-btn layui-btn-sm tip">
                                    <i className="layui-icon">&#xe64a;</i>
                                </button>
                                <button id="componentButtonRely" title="添加动画依赖" type="button" className="layui-btn layui-btn-sm tip">
                                    <i className="layui-icon">&#xe6b1;</i>
                                </button>
                                <button id="componentButtonDelete" title="删除元素" type="button" className="layui-btn layui-btn-sm tip">
                                    <i className="layui-icon">&#xe640;</i>
                                </button>
                                <button id="componentButtonPlay" title="预览" type="button" className="layui-btn layui-btn-sm tip">
                                    <i className="layui-icon">&#xe652;</i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="history">
                        <div className="title">历史列表</div>
                        <div id="historyContent"></div>
                    </div>
                    <div id="info"></div>
                    <script type="text/javascript" src="layui/layui.all.js"></script>
                    <script type="text/javascript" src="js/lodash.js"></script>
                    <script type="text/javascript" src="mppt/main.js"></script>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
