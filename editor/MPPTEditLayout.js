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
                    <link rel="stylesheet" href="mppt/medit.css" />
                    <link rel="stylesheet" href="mppt/control.css" />
                </head>
                <body>
                    <div id="prop">
                        <div className="layui-tab layui-tab-brief">
                            <ul className="layui-tab-title">
                                <li className="layui-this">属性</li>
                                <li>动画</li>
                                <li>操作</li>
                            </ul>
                            <div className="layui-tab-content">
                                <div className="layui-tab-item layui-show">
                                    <PropertyPanel />
                                </div>
                                <div className="layui-tab-item">
                                    <AnimatePanel />
                                </div>
                                <div className="layui-tab-item">
                                    <form id="operatePanel" className="layui-form layui-form-pane" action="">
                                        <div className="layui-form-item">
                                            <label className="layui-form-label">预览</label>
                                            <div className="layui-input-inline">
                                                <div className="layui-btn-group">
                                                    <button id="textResetStyle" type="button" className="layui-btn layui-btn-sm">
                                                        <i className="layui-icon">&#xe652;</i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="layui-form-item">
                                            <label className="layui-form-label">新建文本</label>
                                            <div className="layui-input-inline">
                                                <div className="layui-btn-group">
                                                    <button id="textResetStyle" type="button" className="layui-btn layui-btn-sm">
                                                        <i className="layui-icon">&#xe63c;</i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="layui-form-item">
                                            <label className="layui-form-label">新建图片</label>
                                            <div className="layui-input-inline">
                                                <div className="layui-btn-group">
                                                    <button id="textResetStyle" type="button" className="layui-btn layui-btn-sm">
                                                        <i className="layui-icon">&#xe64a;</i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="phone"></div>
                    <div id="editor">
                        <MarkdownView source={page.content} page={page} container={null} />
                    </div>
                    <div id="history"></div>
                    <div id="info"></div>
                    <script type="text/javascript" src="layui/layui.all.js"></script>
                    <script type="text/javascript" src="mppt/medit.js"></script>
                    <script type="text/javascript" src="mppt/jscolor.js"></script>
                    <script type="text/javascript" src="mppt/control.js"></script>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
