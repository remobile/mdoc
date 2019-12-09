const React = require('react');

module.exports = () => {
    return (
        <form id="imagePropertyPanel" className="layui-form layui-form-pane" action="">
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
