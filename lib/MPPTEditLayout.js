const React = require('react');
const MarkdownView = require('./MarkdownView');
const { support } = require('./utils');

class PPTEditLayout extends React.Component {
    render() {
        const { page } = this.props;
        page.edit = true;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="reveal.js/medit.css" />
                    <link rel="stylesheet" href="layui/css/layui.css" />
                    <script type="text/javascript" src="layui/layui.all.js"></script>
                    <script type="text/javascript" src="reveal.js/medit.js"></script>
                    <script type="text/javascript" src="reveal.js/jscolor.js"></script>
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
                                </div>
                                <div className="layui-tab-item">动画内容</div>
                            </div>
                        </div>

                    </div>
                    <div id="component"></div>
                    <div id="history"></div>
                    <div id="info"></div>
                    <div id="container">
                        <MarkdownView source={page.content} page={page} container={null} />
                    </div>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
