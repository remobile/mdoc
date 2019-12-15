const React = require('react');

module.exports = () => {
    return (
        <form id="propertyPanel" className="layui-form layui-form-pane" action="">
            <div className="layui-form-item for-text">
                <label className="layui-form-label">字体</label>
                <div className="layui-input-block">
                    <select lay-filter="myselect">
                        <option value="SimSun">宋体</option>
                        <option value="SimHei">黑体</option>
                        <option value="KaiTi">楷体</option>
                    </select>
                </div>
            </div>
            <div className="layui-form-item for-text">
                <label className="layui-form-label">大小</label>
                <div className="layui-input-block">
                    <div id="fontSizeSlider" className="slider-container"></div>
                </div>
            </div>
            <div className="layui-form-item for-text">
                <label className="layui-form-label">行距</label>
                <div className="layui-input-block">
                    <div id="lineHeightSlider" className="slider-container"></div>
                </div>
            </div>
            <div className="layui-form-item for-text">
                <label className="layui-form-label">对齐</label>
                <div className="layui-input-inline">
                    <div className="layui-btn-group">
                        <button id="textAlignLeft" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe649;</i>
                        </button>
                        <button id="textAlignCenter" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe647;</i>
                        </button>
                        <button id="textAlignRight" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe648;</i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="layui-form-item for-text">
                <label className="layui-form-label">常规</label>
                <div className="layui-input-inline">
                    <div className="layui-btn-group">
                        <button id="textBold" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe62b;</i>
                        </button>
                        <button id="textUnderLine" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe646;</i>
                        </button>
                        <button id="textItalic" type="button" className="layui-btn layui-btn-sm">
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
                        <div id="colorSlider"></div>
                    </div>
                </div>
            </div>
            <div className="layui-form-item">
                <label className="layui-form-label">背景</label>
                <div className="layui-input-inline">
                    <div>
                        <input type="hidden" name="color" value="" id="textBackgroundColorPicker" />
                        <div id="backgroundColorSlider"></div>
                    </div>
                </div>
            </div>
            <div className="layui-form-item">
                <label className="layui-form-label">清除</label>
                <div className="layui-input-inline">
                    <div className="layui-btn-group">
                        <button id="textResetStyle" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon">&#xe639;</i>
                        </button>
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
