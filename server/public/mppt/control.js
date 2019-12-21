layui.define(['jquery', 'element', 'form', 'colorpicker', 'utils', 'animate', 'history'], function(exports) {
    const $ = layui.$;
    const form = layui.form;
    const slider = layui.slider;
    const colorpicker = layui.colorpicker;
    const history = layui.history;
    const animate = layui.animate;
    const utils = layui.utils;
    const imgCache = {}; // 图片缓存器
    let imageSize;

    let editor;
    let textColorList;
    let textBackgroundColorList;
    let imageColorList;
    let imageBackgroundColorList;
    let imageDialog;
    let musicDialog;

    let clickX = null; // 保留上次的X轴位置
    let clickY = null; // 保留上次的Y轴位置
    let imageCenterShow = false; // 中心点是否显示

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
        const imagePositionTarget = $('#imagePositionTarget');
        const positionTarget = imagePositionTarget[0];
        imagePositionTarget.on('mousedown', function(e) {
            const location = editor.getLocation(e);
            clickY = location.y;
            clickX = location.x;
        });
        imagePositionTarget.on('mouseup', function(e) {
            clickX = null;
            clickY = null;
        });
        imagePositionTarget.on('mousemove', function(e) {
            if (clickX) {
                const target = editor.getAction().target;
                const tx = target.offsetLeft;
                const tw = parseInt(target.style.width);
                const ty = target.offsetTop;
                const th = parseInt(target.style.height);
                const location = editor.getLocation(e);
                const deltaX = clickX - location.x;
                const deltaY = clickY - location.y;
                positionTarget.style.left = (positionTarget.offsetLeft - deltaX) + "px";
                positionTarget.style.top = (positionTarget.offsetTop - deltaY) + "px";
                const x = positionTarget.offsetLeft + tw / 2; // 添加上偏移
                const y = positionTarget.offsetTop + th / 2;

                let offsetX = 0, offsetY = 0;
                if (target.style.backgroundSize === 'auto') {
                    offsetX = (imageSize.w + tw)/4;
                    offsetY = (imageSize.h + th)/4;
                }

                const px = x-tx-th/2+offsetX;
                const py = y-ty-th/2+offsetY;

                target.style.backgroundPositionX = `${px}px`;
                target.style.backgroundPositionY = `${py}px`;
                $('#imageCenter').html(`x: ${px}&emsp;y: ${py}`);

                clickX = location.x;
                clickY = location.y;
            }
            return false;
        });
        // 中心
        $('#imageCenterReset').click(function(){
            const target = editor.getAction().target;
            target.style.backgroundPositionX= 'center';
            target.style.backgroundPositionY= 'center';
            $('#imageCenter').html(`x: 居中&emsp;y: 居中`);
            showImageCenter();
        });
        $('#imageCenterEdit').click(function(){
            if (!imageCenterShow) {
                showImageCenter();
            } else {
                hideImageCenter();
            }
        });

        animate.initialize();
    }
    function showImageCenter() {
        imageCenterShow = true;
        $('#imageCenterReset').removeClass('hide');
        const target = editor.getAction().target;
        getTargetBackImageSize(target, function (size) {
            imageSize = size;
            const button = $('#imageCenterEdit>i')[0];
            const el = document.getElementById('imagePositionTarget');
            button.classList.remove('layui-icon-edit');
            button.classList.add('layui-icon-ok');

            const tw = parseInt(target.style.width);
            const th = parseInt(target.style.height);

            const px = target.style.backgroundPositionX;
            const py = target.style.backgroundPositionY;

            let offsetX = 0, offsetY = 0, x, y;
            if (target.style.backgroundSize === 'auto') {
                offsetX = -(imageSize.w + tw)/4;
                offsetY = -(imageSize.h + th)/4;
                x = px === 'center' || px === '50%' ? (tw-imageSize.w)/2 : parseInt(px);
                y = py === 'center' || py === '50%' ? (th-imageSize.h)/2 : parseInt(py);
            } else {
                x = px === 'center' || px === '50%' ? 0 : parseInt(px);
                y = py === 'center' || py === '50%' ? 0 : parseInt(py);
            }

            x += target.offsetLeft;
            y += target.offsetTop;

            el.style.width = target.style.width;
            el.style.height = target.style.height;
            el.style.left = `${x+offsetX}px`;
            el.style.top = `${y+offsetY}px`;
            el.classList.remove('hide');
        });
    }
    function hideImageCenter() {
        imageCenterShow = false;
        $('#imageCenterReset').addClass('hide');
        const button = $('#imageCenterEdit>i')[0];
        button.classList.add('layui-icon-edit');
        button.classList.remove('layui-icon-ok');
        document.getElementById('imagePositionTarget').classList.add('hide');
    }
    function getTargetBackImageSize(target, callback) {
        const url = utils.getURL(target);
        if (imgCache[url]) {
            callback(imgCache[url]);
        }
        const img = new Image();
        img.onload = function () {
            imgCache[url] = { w: img.width, h:img.height };
            callback(imgCache[url]);
        };
        img.src = url;
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
            $('#propertyPanel').removeClass('for-image').addClass('for-text');
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
            $('#propertyPanel').removeClass('for-text').addClass('for-image');
            // 模式
            $('#imageModeSelect').attr('lay-filter', 'imageModeSelect');
            setModeSelectValue(target);
            form.on(`select(imageModeSelect)`, function(data){
                hideImageCenter();
                switch (data.value) {
                    case 'stretch': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = '100% 100%';
                        break;
                    }
                    case 'origin': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'auto';
                        break;
                    }
                    case 'contain': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'contain';
                        break;
                    }
                    case 'cover': {
                        target.style.backgroundRepeat = 'no-repeat';
                        target.style.backgroundSize = 'cover';
                        break;
                    }
                    case 'repeat': {
                        target.style.backgroundRepeatX = 'repeat';
                        target.style.backgroundRepeatY = 'repeat';
                        target.style.backgroundSize = 'auto';
                        break;
                    }
                    case 'repeatX': {
                        target.style.backgroundRepeatX = 'repeat';
                        target.style.backgroundRepeatY = 'no-repeat';
                        target.style.backgroundSize = 'auto';
                        break;
                    }
                    case 'repeatY': {
                        target.style.backgroundRepeatX = 'no-repeat';
                        target.style.backgroundRepeatY = 'repeat';
                        target.style.backgroundSize = 'auto';
                        break;
                    }
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
    function setModeSelectValue(el) {
        const size = el.style.backgroundSize;
        const repeatX = el.style.backgroundRepeatX;
        const repeatY = el.style.backgroundRepeatY;
        let type = '';
        if (size === 'auto') {
            if (repeatX === 'repeat' && repeatY === 'repeat') {
                type = 'repeat';
            } else if (repeatX === 'repeat') {
                type = 'repeatX';
            } else if (repeatY === 'repeat') {
                type = 'repeatY';
            } else {
                type = 'origin';
            }
        } else if (size === 'contain') {
            type = 'contain';
        } else if (size === 'cover') {
            type = 'cover';
        } else {
            type = 'stretch';
        }
        $(`#imageModeSelect`).val(type);
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
                const url = utils.getURL(target);
                if (src !== url) {
                    target.style.backgroundImage = `url(${src})`;
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
        isImageCenterShow: ()=>imageCenterShow,
        hideImageCenter,
    });

    // 全局函数
    window.onSelectMediaFile = onSelectMediaFile;
});
