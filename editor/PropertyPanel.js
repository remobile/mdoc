const React = require('react');

module.exports = () => {
    return (
        <form id="propertyPanel" className="layui-form layui-form-pane" action="">
            <div className="layui-form-item for-text">
                <label className="layui-form-label">字体</label>
                <div className="layui-input-block">
                    <select id="fontSelect">
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
            <div className="layui-form-item for-image">
                <label className="layui-form-label">模式</label>
                <div className="layui-input-block">
                    <select id="imageModeSelect">
                        <option value="stretch">拉伸</option>
                        <option value="origin">原始</option>
                        <option value="contain">包裹</option>
                        <option value="cover">覆盖</option>
                        <option value="repeat">重复</option>
                        <option value="repeatX">横向重复</option>
                        <option value="repeatY">纵向重复</option>
                    </select>
                </div>
            </div>
            <div className="layui-form-item for-image">
                <label className="layui-form-label">中心</label>
                <div className="row">
                    <div id="imageCenter">{'x: 100  y: 100'}</div>
                    <div className="layui-btn-group">
                        <button id="imageCenterReset" type="button" className="layui-btn layui-btn-sm hide">
                            <i className="iconfont icon-target"></i>
                        </button>
                        <button id="imageCenterEdit" type="button" className="layui-btn layui-btn-sm">
                            <i className="layui-icon layui-icon-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="layui-form-item for-image">
                <label className="layui-form-label">弧度</label>
                <div className="layui-input-block">
                    <div id="borderRadiusSlider" className="slider-container"></div>
                </div>
            </div>
            <div className="layui-form-item for-text">
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
                        <button id="resetStyle" type="button" className="layui-btn layui-btn-sm">
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
