const React = require('react');
module.exports = () => {
    return (
        <div className="layui-tab-item layui-show">
            <div id="historyContent"></div>
            <div className="bottom-buttons">
                <div className="layui-btn-group">
                    <button id="historyButtonBack" title="回滚历史(alt+z)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-forward"></i>
                    </button>
                    <button id="historyButtonForward" title="恢复历史(alt+y)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-back"></i>
                    </button>
                    <button id="historyButtonHistory" title="优化历史列表(alt+h)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe656;</i>
                    </button>
                    <button id="historyButtonPlay" title="预览本页(alt+p)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe652;</i>
                    </button>
                    <button id="historyButtonPlayAll" title="预览全页" type="button" className="layui-btn tip">
                        <i className="iconfont icon-film"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
