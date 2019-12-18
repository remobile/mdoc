const React = require('react');
module.exports = () => {
    return (
        <div className="layui-tab-item layui-show">
            <div id="pageContent"></div>
            <div className="bottom-buttons">
                <div className="layui-btn-group">
                    <button id="pageButtonCopy" title="复制本页" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe663;</i>
                    </button>
                    <button id="pageButtonDelete" title="删除本页" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe640;</i>
                    </button>
                    <button id="pageButtonNew" title="新建页面" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe654;</i>
                    </button>
                    <button id="pageButtonSetBackground" title="设置背景" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe652;</i>
                    </button>
                    <button id="pageButtonHelp" title="查看帮助(alt+?)" type="button" className="layui-btn tip">
                        <i className="layui-icon">&#xe607;</i>
                    </button>
                </div>
            </div>
        </div>
    );
}
