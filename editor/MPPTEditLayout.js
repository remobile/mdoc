const React = require('react');
const MarkdownView = require('../lib/MarkdownView');
const { support } = require('../lib/utils');
const PropertyPanel = require('./PropertyPanel');
const AnimatePanel = require('./AnimatePanel');
const ComponentPanel = require('./ComponentPanel');
const HistoryPanel = require('./HistoryPanel');
const PagePanel = require('./PagePanel');

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
                    <link rel="stylesheet" href="ppt/css/animate.css" />
                    <link rel="stylesheet" href="mppt/panel.css" />
                    <link rel="stylesheet" href="mppt/editor.css" />
                    <link rel="stylesheet" href="mppt/control.css" />
                    <link rel="stylesheet" href="mppt/animate.css" />
                    <link rel="stylesheet" href="mppt/component.css" />
                    <link rel="stylesheet" href="mppt/history.css" />
                    <link rel="stylesheet" href="mppt/page.css" />
                </head>
                <body>
                    <div id="leftPanel">
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
                    <div id="editor" style={{backgroundColor: page.backgroundColor||page.config.backgroundColor, backgroundImage: `url(${page.backgroundImage||page.config.backgroundImage})` }}>
                        <MarkdownView source={page.content} page={page} container={null} />
                    </div>
                    <div id="rightPanel">
                        <div className="layui-tab layui-tab-brief">
                            <ul className="layui-tab-title">
                                <li className="layui-this">组件</li>
                                <li>历史</li>
                                <li>页面</li>
                            </ul>
                            <div className="layui-tab-content">
                                <ComponentPanel />
                                <HistoryPanel />
                                <PagePanel />
                            </div>
                        </div>
                    </div>
                    <script type="text/javascript" src="other/sortable.js"></script>
                    <script type="text/javascript" src="layui/layui.all.js"></script>
                    <script type="text/javascript" src="js/lodash.js"></script>
                    <script type="text/javascript" src="mppt/main.js"></script>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
