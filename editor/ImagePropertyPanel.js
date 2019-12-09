const React = require('react');

module.exports = () => {
    return (
        <form id="imagePropertyPanel" className="layui-form layui-form-pane" action="">
            <div className="layui-form-item">
                <label className="layui-form-label">位置</label>
                <div className="layui-input-inline">
                    <div className="layui-btn-group">
                        <div id="textPositionSize"></div>
                    </div>
                </div>
            </div>
        </form>
    );
}
