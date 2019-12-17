const React = require('react');
module.exports = () => {
    return (
        <div className="layui-tab-item layui-show">
            <div id="historyContent"></div>
            <div className="bottom-buttons">
                <div className="layui-btn-group">
                    <button id="historyButtonText" title="撤销历史(alt+t)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-aui-icon-back"></i>
                    </button>
                    <button id="historyButtonImage" title="回滚历史(alt+m)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-aui-icon-forward"></i>
                    </button>
                    <button id="historyButtonHistory" title="优化历史列表(alt+h)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe656;</i>
                    </button>
                    <button id="componentButtonPlay" title="预览本页(alt+p)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe652;</i>
                    </button>
                    <button id="historyButtonHelp" title="查看帮助(alt+?)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe607;</i>
                    </button>
                </div>
            </div>
        </div>
    );
}
