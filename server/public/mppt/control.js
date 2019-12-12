layui.define(['jquery', 'form', 'colorpicker'], function(exports) {
    const $ = layui.$;
    const form = layui.form;
    const slider = layui.slider;
    const colorpicker = layui.colorpicker;

    let editor;
    let textColorList;
    let textBackgroundColorList;

    function initialize() {
        editor = layui.editor;
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
            setAnimate((target)=>{
                console.log("=======", data.value);
                target.dataset.animate = data.value;
            })
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
    function setTextStyle(callback) {
        const referents = editor.getReferents();
        if (referents.length) {
            for (const referent of referents) {
                const target = referent.target;
                if (target.classList.contains('text')) {
                    callback(target);
                }
            }
        }
    }
    function setImageStyle(callback) {
        const referents = editor.getReferents();
        if (referents.length) {
            for (const referent of referents) {
                const target = referent.target;
                if (!target.classList.contains('text')) {
                    callback(target);
                }
            }
        }
    }
    function setAnimate(callback) {
        const referents = editor.getReferents();
        if (referents.length) {
            for (const referent of referents) {
                const target = referent.target;
                callback(target);
            }
        }
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
                done: function(fontSize){
                    console.log("=======", fontSize);
                },
                change: function(fontSize){
                    setTextStyle((target)=>{
                        target.style.fontSize = fontSize + 'px';
                    });
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
                    pushHistory('设置文字颜色');
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
                    pushHistory('设置文字背景颜色');
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
                    pushHistory('设置文字颜色');
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
                    pushHistory('设置文字背景颜色');
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
    });
});
