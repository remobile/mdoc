layui.define(['jquery', 'element', 'form', 'colorpicker', 'utils', 'animate', 'history'], function(exports) {
    const $ = layui.$;
    const form = layui.form;
    const slider = layui.slider;
    const colorpicker = layui.colorpicker;
    const history = layui.history;
    const animate = layui.animate;
    const utils = layui.utils;

    let editor;
    let textColorList;
    let textBackgroundColorList;
    let imageColorList;
    let imageBackgroundColorList;
    let imageDialog;
    let musicDialog;

    function initialize() {
        editor = layui.editor;
        const settings = layui.data('settings');
        textColorList = [...(settings.textColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textColorList.length > 22 && ( textColorList.length = 22 );
        textBackgroundColorList = [...(settings.textBackgroundColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textBackgroundColorList.length > 22 && ( textBackgroundColorList.length = 22 );
        imageColorList = [...(settings.imageColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        imageColorList.length > 22 && ( imageColorList.length = 22 );
        imageBackgroundColorList = [...(settings.imageBackgroundColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        imageBackgroundColorList.length > 22 && ( imageBackgroundColorList.length = 22 );

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
            toggleTextStyle('bold');
        });
        $('#textUnderLine').click(()=>{
            toggleTextStyle('underline');
        });
        $('#textItalic').click(()=>{
            toggleTextStyle('italic');
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
        animate.initialize();
    }
    function toggleTextStyle(type) {
        if (type === 'italic') {
            const success = setTextStyle((target)=>{
                if (target.style.fontStyle !== 'normal' || !target.style.fontStyle) {
                    target.style.fontStyle = 'normal';
                } else {
                    target.style.fontStyle = 'italic';
                }
            });
            success && history.pushHistory('切换字体斜体');
        } else if (type === 'bold') {
            const success = setTextStyle((target)=>{
                if (target.style.fontWeight !== 'normal' || !target.style.fontWeight) {
                    target.style.fontWeight = 'normal';
                } else {
                    target.style.fontWeight = 'bold';
                }
            });
            success && history.pushHistory('切换字体加粗');
        } else if (type === 'underline') {
            const success = setTextStyle((target)=>{
                if (target.style.textDecoration !== 'none' || !target.style.textDecoration) {
                    target.style.textDecoration = 'none';
                } else {
                    target.style.textDecoration = 'underline';
                }
            });
            success && history.pushHistory('切换字体下划线');
        }
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
    function setImageColorList(color) {
        const index = imageColorList.indexOf(color);
        if (index !== -1) {
            imageColorList.splice(index, 1);
        }
        imageColorList.unshift(color);
        if (imageColorList.length > 22) {
            imageColorList.length = 22;
        }
        layui.data('settings', { key: 'imageColorList', value: imageColorList });
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
    function setImageBackgroundColorList(color) {
        const index = imageBackgroundColorList.indexOf(color);
        if (index !== -1) {
            imageBackgroundColorList.splice(index, 1);
        }
        imageBackgroundColorList.unshift(color);
        if (imageBackgroundColorList.length > 22) {
            imageBackgroundColorList.length = 22;
        }
        layui.data('settings', { key: 'imageBackgroundColorList', value: imageBackgroundColorList });
    }
    function setTextStyle(callback) {
        const referents = editor.getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (target.classList.contains('text')) {
                callback(target);
            }
        }
        return !!referents.length;
    }
    function setImageStyle(callback) {
        const referents = editor.getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (!target.classList.contains('text')) {
                callback(target);
            }
        }
        return !!referents.length;
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
                elem: '#colorSlider',
                color: style.color,
                format: 'rgb',
                predefine: true,
                colors: textColorList,
                alpha: true,
                done: function(color){
                    setTextColorList(color);
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.color = color;
                    });
                    history.pushHistory('设置文字颜色');
                },
            });
            // 背景颜色
            colorpicker.render({
                elem: '#backgroundColorSlider',
                color: style.backgroundColor,
                format: 'rgb',
                predefine: true,
                colors: textBackgroundColorList,
                alpha: true,
                done: function(color){
                    setTextBackgroundColorList(color);
                },
                change: function(color){
                    setTextStyle((target)=>{
                        target.style.backgroundColor = color;
                    });
                    history.pushHistory('设置文字背景颜色');
                },
            });
            // 位置大小
            updatePositionSize(target, style);
        } else {
            $('#propertyPanel').addClass('for-image');
            // 模式
            $('#imageModeSelect').attr('lay-filter', 'imageModeSelect');
            form.on(`select(imageModeSelect)`, function(data){
                switch (data.value) {
                    case 'stretch': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = '100% 100%';
                        target.style.backgroundPosition = '0px 0px';
                        break;
                    }
                    case 'center': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'auto';
                        target.style.backgroundPosition = 'center';
                        break;
                    }
                    case 'contain': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'contain';
                        target.style.backgroundPosition = 'center';
                        break;
                    }
                    case 'cover': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'cover';
                        target.style.backgroundPosition = 'center';
                        break;
                    }
                    case 'repeat': {
                        target.style.backgroundRepeat = 'repeat';
                        target.style.backgroundSize = 'auto';
                        target.style.backgroundPosition = 'center';
                        break;
                    }
                    case 'custom': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'auto';
                        target.style.backgroundPosition = 'center';
                        break;
                    }
                }
                if (data.value === 'none') {
                    $('.no-animate').hide();
                    $('.no-animate-ext').hide();
                    setAnimate();
                } else {
                    $('.no-animate').show();
                    $('.no-animate-ext').show();
                    setAnimate({ name: data.value });
                    updateValues(target);
                }
            });
            // 颜色
            colorpicker.render({
                elem: '#colorSlider',
                color: style.color,
                format: 'rgb',
                predefine: true,
                colors: imageColorList,
                alpha: true,
                done: function(color){
                    setImageColorList(color);
                },
                change: function(color){
                    setImageStyle((target)=>{
                        target.style.color = color;
                    });
                    history.pushHistory('设置图片颜色');
                },
            });
            // 背景颜色
            colorpicker.render({
                elem: '#backgroundColorSlider',
                color: style.backgroundColor,
                format: 'rgb',
                predefine: true,
                colors: imageBackgroundColorList,
                alpha: true,
                done: function(color){
                    setImageBackgroundColorList(color);
                },
                change: function(color){
                    setImageStyle((target)=>{
                        target.style.backgroundColor = color;
                        history.pushHistory('设置图片背景颜色');
                    });
                },
            });
            // 位置大小
            updatePositionSize(target, style);
        }

        animate.updateValues(target);
    }
    function updatePositionSize(target, style) {
        style = style || getComputedStyle(target);
        $('#textPositionSize').html(`x: ${parseInt(style.left)}&emsp;y: ${parseInt(style.top)}&emsp;w: ${parseInt(style.width)}&emsp;h: ${parseInt(style.height)}`);
    }
    function showImageSelect(subtype) {
        utils.postPlain('/getMediaFiles', { type: 0, subtype }, (content)=>{
            imageDialog = layer.open({
                type: 1,
                title: '图片',
                offset: ['100px', '300px'], //位置
                area: ['840px', '600px'], //宽高
                shadeClose: true,
                content,
            });
        });
    }
    function showMusicSelect() {
        utils.postPlain('/getMediaFiles', { type: 1 }, (content)=>{
            musicDialog = layer.open({
                type: 1,
                title: '音乐',
                offset: ['100px', '300px'], //位置
                area: ['840px', '600px'], //宽高
                shadeClose: true,
                content,
            });
        });
    }
    function onSelectMediaFile(src, type, subtype) {
        if (type === 0) {
            if (subtype === 0) { // 修改图片地址
                const target = editor.getAction().target;
                const url = `url("${src}")`;
                if (target.style.backgroundImage !== url) {
                    target.style.backgroundImage = url;
                    history.pushHistory('改变图片地址');
                }
                layer.close(imageDialog);
            } else if (subtype === 1) { // 修改背景图片
                utils.post('/setBackgroundImage', { src }, ()=>{
                    location.reload();
                });
            }
        } else {
            utils.post('/setBackgroundMusic', { src }, ()=>{
                utils.toast('设置成功');
            });
        }
    }

    // 导出函数
    exports('control', {
        initialize,
        updateValues,
        updatePositionSize,
        showImageSelect,
        showMusicSelect,
        setTextStyle,
    });

    // 全局函数
    window.onSelectMediaFile = onSelectMediaFile;
});
