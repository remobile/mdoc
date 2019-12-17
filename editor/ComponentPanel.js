const React = require('react');

module.exports = () => {
    return (
        <div className="layui-tab-item layui-show">
            <div id="componentContent"></div>
            <div className="bottom-buttons">
                <div className="layui-btn-group">
                    <button id="componentButtonText" title="新建文本(alt+t)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe63c;</i>
                    </button>
                    <button id="componentButtonImage" title="新建图片(alt+m)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe64a;</i>
                    </button>
                    <button id="componentButtonDelete" title="删除元素(alt+del)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe640;</i>
                    </button>
                    <button id="componentButtonHistory" title="锁定模板(alt+h)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-aui-icon-lock"></i>
                    </button>
                    <button id="componentButtonHelp" title="切换模板可见(alt+?)" type="button" className="layui-btn tip">
                        <i className="iconfont icon-aui-icon-display"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
