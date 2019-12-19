const React = require('react');
module.exports = () => {
    return (
        <div className="layui-tab-item">
            <div id="pageContent"></div>
            <div className="bottom-buttons">
                <div className="layui-btn-group">
                    <button id="pageButtonCopy" title="复制本页" type="button" className="layui-btn tip">
                        <i className="iconfont icon-copy"></i>
                    </button>
                    <button id="pageButtonDelete" title="删除本页" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe640;</i>
                    </button>
                    <button id="pageButtonSetBackground" title="设置背景" type="button" className="layui-btn tip">
                        <i className="iconfont icon-background"></i>
                    </button>
                    <button id="pageButtonSetMusic" title="设置音乐" type="button" className="layui-btn tip">
                        <i className="iconfont icon-music"></i>
                    </button>
                    <button id="pageButtonHelp" title="查看帮助(alt+?)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe607;</i>
                    </button>
                </div>
            </div>
        </div>
    );
}
