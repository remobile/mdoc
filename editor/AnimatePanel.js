const React = require('react');

module.exports = () => {
    return (
        <div>
            <form id="animatePanel" className="layui-form layui-form-pane" action="">
                <div className="layui-form-item">
                    <label className="layui-form-label">动画</label>
                    <div className="layui-input-block">
                        <select id="animateList0">
                        </select>
                    </div>
                </div>
                <div className="layui-form-item no-animate">
                    <label className="layui-form-label">循环</label>
                    <div className="layui-input-block">
                        <div id="animateLoopSlider0" className="slider-container"></div>
                    </div>
                </div>
                <div className="layui-form-item no-animate">
                    <label className="layui-form-label">时长</label>
                    <div className="layui-input-block">
                        <div id="animateDurationSlider0" className="slider-container"></div>
                    </div>
                </div>
                <div className="layui-form-item no-animate">
                    <label className="layui-form-label">延时</label>
                    <div className="layui-input-block">
                        <div id="animateDelaySlider0" className="slider-container"></div>
                    </div>
                </div>
                <div className="layui-form-item no-animate">
                    <label className="layui-form-label">依赖</label>
                    <div className="layui-input-block">
                        <div id="animateRely"></div>
                    </div>
                </div>
            </form>
            <div id="animateFollows" className="no-animate"></div>
            <button id="addAnimateButton" type="button" className="layui-btn layui-btn-primary no-animate-ext"><i className="layui-icon">&#xe654;</i></button>
        </div>
    );
}
