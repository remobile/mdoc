const React = require('react');

module.exports = () => {
    return (
        <div id="rightBottomPanel">
            <div className="layui-btn-group">
                <button id="componentButtonText" title="新建文本(alt+t)" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe63c;</i>
                </button>
                <button id="componentButtonImage" title="新建图片(alt+m)" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe64a;</i>
                </button>
                <button id="componentButtonDelete" title="删除元素" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe640;</i>
                </button>
                <button id="componentButtonHistory" title="优化历史列表" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe656;</i>
                </button>
                <button id="componentButtonPlay" title="预览本页" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe652;</i>
                </button>
                <button id="componentButtonHelp" title="查看帮助" type="button" className="layui-btn layui-btn-sm tip">
                    <i className="layui-icon">&#xe607;</i>
                </button>
            </div>
        </div>
    );
}
