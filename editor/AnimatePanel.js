const React = require('react');

module.exports = () => {
    return (
        <form id="animatePanel" className="layui-form layui-form-pane" action="">
            <div className="layui-form-item">
                <label className="layui-form-label">动画</label>
                <div className="layui-input-block">
                    <select id="animateList" lay-filter="animateList">
                        <option value="none">无</option>
                        <option value="zoomIn">中心放大</option>
                        <option value="fadeIn">淡入</option>
                        <option value="slideInDown">从上划入</option>
                        <option value="slideInUp">从下划入</option>
                        <option value="slideInLeft">从左划入</option>
                        <option value="slideInRight">从右划入</option>
                    </select>
                </div>
            </div>
            <div className="layui-form-item">
                <label className="layui-form-label">时长</label>
                <div className="layui-input-block">
                    <div id="animateLongSlider"></div>
                </div>
            </div>
            <div className="layui-form-item">
                <label className="layui-form-label">延时</label>
                <div className="layui-input-block">
                    <div id="animateDelaySlider"></div>
                </div>
            </div>
            <div className="layui-form-item">
                <label className="layui-form-label">依赖</label>
                <div className="layui-input-block">
                    <select id="animateRelyComponents" lay-filter="animateRelyComponents">
                        <option value="none">无</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
