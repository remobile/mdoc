layui.define(['jquery', 'form', 'colorpicker', 'history'], function(exports) {
    const $ = layui.$;
    const form = layui.form;
    const slider = layui.slider;
    const colorpicker = layui.colorpicker;
    const history = layui.history;

    let editor;
    let component;
    let textColorList;
    let textBackgroundColorList;

    function initialize() {
        editor = layui.editor;
        component = layui.component;
        const settings = layui.data('settings');
        textColorList = [...(settings.textColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textColorList.length > 22 && ( textColorList.length = 22 );
        textBackgroundColorList = [...(settings.textBackgroundColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textBackgroundColorList.length > 22 && ( textBackgroundColorList.length = 22 );

        $('#textAlignLeft').click(()=>{
            setTextStyle((target)=>{
                target.style.textAlign = 'left';
            });
        });
        $('#textAlignCenter').click(()=>{
            setTextStyle((target)=>{
                target.style.textAlign = 'center';
            });
        });
        $('#textAlignRight').click(()=>{
            setTextStyle((target)=>{
                target.style.textAlign = 'right';
            });
        });
        $('#textBold').click(()=>{
            setTextStyle((target)=>{
                if (target.style.fontWeight !== 'normal' || !target.style.fontWeight) {
                    target.style.fontWeight = 'normal';
                } else {
                    target.style.fontWeight = 'bold';
                }
            });
        });
        $('#textUnderLine').click(()=>{
            setTextStyle((target)=>{
                if (target.style.textDecoration !== 'none' || !target.style.textDecoration) {
                    target.style.textDecoration = 'none';
                } else {
                    target.style.textDecoration = 'underline';
                }
            });
        });
        $('#textItalics').click(()=>{
            setTextStyle((target)=>{
                if (target.style.fontStyle !== 'normal' || !target.style.fontStyle) {
                    target.style.fontStyle = 'normal';
                } else {
                    target.style.fontStyle = 'italic';
                }
            });
        });
        $('#textResetStyle').click(()=>{
            setTextStyle((target)=>{
                target.style.fontSize = 14;
                target.style.textAlign = 'left';
                target.style.fontWeight = 'normal';
                target.style.textDecoration = 'none';
                target.style.fontStyle = 'normal';
                target.style.color = 'rgba(0,0,0,1)';
                target.style.backgroundColor = 'rgba(255,255,255,1)';
            });
            pushHistory('清除样式');
        });
        // 动画列表选择
        $('#animateList').attr('lay-filter', 'animateList');
        form.on('select(animateList)', function(data){
            setAnimate({ animate: data.value });
        });
    }

    function setTextColorList(color) {
        const index = textColorList.indexOf(color);
        if (index !== -1) {
            textColorList.splice(index, 1);
        }
        textColorList.unshift(color);
        if (textColorList.length > 22) {
            textColorList.length = 22;
        }
        layui.data('settings', { key: 'textColorList', value: textColorList });
    }
    function setTextBackgroundColorList(color) {
        const index = textBackgroundColorList.indexOf(color);
        if (index !== -1) {
            textBackgroundColorList.splice(index, 1);
        }
        textBackgroundColorList.unshift(color);
        if (textBackgroundColorList.length > 22) {
            textBackgroundColorList.length = 22;
        }
        layui.data('settings', { key: 'textBackgroundColorList', value: textBackgroundColorList });
    }
    function getReferents() {
        const referents = editor.getReferents();
        return referents.filter(o=>o.active);
    }
    function setTextStyle(callback) {
        const referents = getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (target.classList.contains('text')) {
                callback(target);
            }
        }
    }
    function setImageStyle(callback) {
        const referents = getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (!target.classList.contains('text')) {
                callback(target);
            }
        }
    }
    function setAnimate(options) {
        const referents = getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (options) {
                target.dataset.animate = formatAnimate(target.dataset.animate, options);
                options.rely && $('#animateRely').html(component.getRelyItem(options.rely));
            } else {
                delete target.dataset.animate;
            }
        }
    }
    // 设置动画(格式:zoomIn:a:b:c 其中a为时长,b为延时，c为依赖id)
    function parseAnimate(animate, options = {}) {
        const list = animate.split(':');
        animate = list[0];
        const timeLong = list[1]; // 时长
        const delay = list[2]; // 延时
        let rely = list[3]; // 依赖
        return { animate, timeLong, delay, rely, ...options };
    }
    function formatAnimate(animate, options) {
        animate = parseAnimate(animate, options);
        return `${animate.animate||''}:${animate.timeLong||''}:${animate.delay||''}:${animate.rely||''}`.replace(/:*$/, '');
    }
    // 更新属性的值
    function updateValues(target) {
        if (!target) {
            $('#propertyPanel').hide();
            $('#animatePanel').hide();
            return;
        }
        $('#propertyPanel').show();
        $('#animatePanel').show();

        let animate = target.dataset.animate;
        if (animate) {
            animate = parseAnimate(animate, { timeLong: 2, delay: 0 });
            $('.layui-form-item.no-animate').show();
            $("#animateList").val(animate);
            // 设置依赖
            $('#animateRely').html(component.getRelyItem(animate.rely));

            form.render('select');
            slider.render({
                elem: '#animateLongSlider',
                value: animate.timeLong,
                min: 1,
                max: 10,
                change: function(timeLong){
                    setAnimate({ timeLong });
                },
            });
            slider.render({
                elem: '#animateDelaySlider',
                value: animate.delay,
                min: 0,
                max: 10,
                change: function(delay){
                    setAnimate({ delay })
                },
            });
        } else {
            $('.layui-form-item.no-animate').hide();
        }

        // 设置样式
        const style = getComputedStyle(target);
        if (target.classList.contains('text')) {
            $('#propertyPanel').removeClass('for-image');
            // 字体大小
            let fontSize = parseInt(style.fontSize);
            slider.render({
                elem: '#fontSizeSlider',
                value: fontSize,
                min: 9,
                max: 180,
                change: function(fontSize){
                    setTextStyle((target)=>{
                        target.style.fontSize = fontSize + 'px';
                    });
                    history.pushHistory('设置字体大小');
                },
            });
            // 行距
            let lineHeight = target.style.lineHeight;
            if (!lineHeight || lineHeight === 'normal') {
                lineHeight = 1.23;
            } else {
                lineHeight = parseFloat(lineHeight);
            }
            slider.render({
                elem: '#lineHeightSlider',
                value: lineHeight*100,
                min: 80,
                max: 800,
                change: function(lineHeight){
                    setTextStyle((target)=>{
                        target.style.lineHeight = lineHeight / 100;
                    });
                    history.pushHistory('设置文本行距');
                },
            });
            // 颜色
            colorpicker.render({
                elem: '#textColor',
                color: style.color,
                format: 'rgb',
                predefine: true,
                colors: textColorList,
                alpha: true,
                done: function(color){
                    setTextColorList(color);
                    history.pushHistory('设置文字颜色');
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.color = color;
                    });
                },
            });
            // 背景颜色
            colorpicker.render({
                elem: '#textBackgroundColor',
                color: style.backgroundColor,
                format: 'rgb',
                predefine: true,
                alpha: true,
                done: function(color){
                    setTextBackgroundColorList(color);
                    history.pushHistory('设置文字背景颜色');
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.backgroundColor = color;
                    });
                },
            });
            // 位置大小
            updatePositionSize(target, style);
        } else {
            $('#propertyPanel').addClass('for-image');
            // 颜色
            colorpicker.render({
                elem: '#textColor',
                color: style.color,
                format: 'rgb',
                predefine: true,
                colors: textColorList,
                alpha: true,
                done: function(color){
                    setTextColorList(color);
                    history.pushHistory('设置文字颜色');
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.color = color;
                    });
                },
            });
            // 背景颜色
            colorpicker.render({
                elem: '#textBackgroundColor',
                color: style.backgroundColor,
                format: 'rgb',
                predefine: true,
                alpha: true,
                done: function(color){
                    setTextBackgroundColorList(color);
                    history.pushHistory('设置文字背景颜色');
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.backgroundColor = color;
                    });
                },
            });
            // 位置大小
            updatePositionSize(target, style);
        }
    }
    function updatePositionSize(target, style) {
        style = style || getComputedStyle(target);
        $('#textPositionSize').html(`x: ${parseInt(style.left)}&emsp;y: ${parseInt(style.top)}&emsp;w: ${parseInt(style.width)}&emsp;h: ${parseInt(style.height)}`);
    }

    exports('control', {
        initialize,
        updateValues,
        updatePositionSize,
        setAnimate,
    });
});
