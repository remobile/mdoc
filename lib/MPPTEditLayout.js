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
                            </ul>
                            <div className="layui-tab-content">
                                <div className="layui-tab-item layui-show">
                                    <form className="layui-form layui-form-pane" action="">
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">字体</label>
                                        <div className="layui-input-block">
                                            <select name="fang" id="123" lay-filter="myselect">
                                                <option value="SimSun">宋体</option>
                                                <option value="SimHei">黑体</option>
                                                <option value="KaiTi">楷体</option>
                                             </select>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">大小</label>
                                        <div className="layui-input-block">
                                          <div id="fontSizeSlider"></div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">行距</label>
                                        <div className="layui-input-block">
                                          <div id="lineHeightSlider"></div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">对齐</label>
                                        <div className="layui-input-inline">
                                            <div className="layui-btn-group">
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe649;</i>
                                                </button>
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe647;</i>
                                                </button>
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe648;</i>
                                                </button>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">常规</label>
                                        <div className="layui-input-inline">
                                            <div className="layui-btn-group">
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe62b;</i>
                                                </button>
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe646;</i>
                                                </button>
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                    <i className="layui-icon">&#xe644;</i>
                                                </button>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">颜色</label>
                                        <div className="layui-input-inline">
                                            <div>
                                                <input type="hidden" name="color" value="" id="textColorPicker" />
                                                <div id="textColor"></div>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">背景</label>
                                        <div className="layui-input-inline">
                                            <div>
                                                <input type="hidden" name="color" value="" id="textBackgroundColorPicker" />
                                                <div id="textBackgroundColor"></div>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="layui-form-item">
                                        <label className="layui-form-label">清除</label>
                                        <div className="layui-input-inline">
                                            <div className="layui-btn-group">
                                                <button type="button" className="layui-btn layui-btn-sm">
                                                  <i className="layui-icon">&#xe639;</i>
                                                </button>
                                            </div>
                                        </div>
                                      </div>
                                    </form>
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
