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
    let imageColorList;
    let imageBackgroundColorList;

    function initialize() {
        editor = layui.editor;
        component = layui.component;
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
        // 动画列表选择
        $('#animateList').attr('lay-filter', 'animateList');
        form.on('select(animateList)', function(data){
            if (data.value === 'none') {
                $('.layui-form-item.no-animate').hide();
                setAnimate();
            } else {
                $('.layui-form-item.no-animate').show();
                setAnimate({ name: data.value });
            }
        });
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
        return !!referents.length;
    }
    function setImageStyle(callback) {
        const referents = getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (!target.classList.contains('text')) {
                callback(target);
            }
        }
        return !!referents.length;
    }
    function showItemAnimate(target, animate) {
        const name = animate.name;
        target.classList.add('animated', name);
        function handleAnimationEnd() {
            target.classList.remove('animated', name);
            target.removeEventListener('animationend', handleAnimationEnd);
        }
        target.addEventListener('animationend', handleAnimationEnd);
    }
    function showAnimate(parent, target, animate, force) {
        const name = animate.name;
        const rely = animate.rely;
        const duration = animate.duration;
        const delay = animate.delay;
        const loop = animate.loop;

        if (name) {
            if (force || !rely) {
                target.classList.add('animated', name);
                duration && (target.style.animationDuration = `${duration*1000}ms`);
                !!parent && delay && (target.style.animationDelay = `${delay*1000}ms`);
                !!parent && loop && (target.style.animationIterationCount = loop==-1 ? 'infinite' : loop);
                function handleAnimationEnd() {
                    target.classList.remove('animated', name);
                    delete target.style.animationDuration;
                    delete target.style.animationDelay;
                    delete target.style.animationIterationCount;
                    target.removeEventListener('animationend', handleAnimationEnd);
                    // 如果有依赖该节点的，执行依赖该节点的动画
                    const id = target.id;
                    parent.children().each(function(){
                        animate = parseAnimate(this.dataset.animate);
                        if (animate.name) {
                            if (animate.rely === id) {
                                showAnimate(parent, this, animate, true);
                            }
                        }
                    });
                }
                target.addEventListener('animationend', handleAnimationEnd);
            }
        }
    }
    function setAnimate(options) {
        const referents = getReferents();
        for (const referent of referents) {
            const target = referent.target;
            if (options) {
                let animate = target.dataset.animate;
                const _animate = parseAnimate(animate);
                animate = { ..._animate, ...options };
                target.dataset.animate = `${animate.name||''}:${animate.rely||''}:${animate.duration||''}:${animate.delay||''}:${animate.loop||''}`.replace(/:*$/, '');
                showItemAnimate(target, animate);
                options.rely != _animate.rely && $('#animateRely').html(component.getRelyItem(options.rely));
            } else {
                delete target.dataset.animate;
            }
            history.pushHistory('设置动画');
        }
    }
    // 设置动画(格式:zoomIn:a:b:c:d 其中a:依赖id,b:时长,c:延时,d:loop)
    function parseAnimate(animate = '') {
        const list = animate.split(':');
        const name = list[0];
        const rely = list[1]; // 依赖
        const duration = list[2]; // 时长
        const delay = list[3]; // 延时
        const loop = list[4]; // loop
        return { name, rely, duration, delay, loop };
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
            animate = parseAnimate(animate);
            $('.layui-form-item.no-animate').show();
            $("#animateList").val(animate.name);
            // 设置依赖
            $('#animateRely').html(component.getRelyItem(animate.rely));

            form.render('select');
            slider.render({
                elem: '#animateLoopSlider',
                value: animate.loop,
                min: -1,
                max: 10,
                change: function(loop){
                    setAnimate({ loop });
                },
            });
            slider.render({
                elem: '#animateLongSlider',
                value: animate.duration,
                min: 0,
                max: 10,
                change: function(duration){
                    setAnimate({ duration });
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
    }
    function updatePositionSize(target, style) {
        style = style || getComputedStyle(target);
        $('#textPositionSize').html(`x: ${parseInt(style.left)}&emsp;y: ${parseInt(style.top)}&emsp;w: ${parseInt(style.width)}&emsp;h: ${parseInt(style.height)}`);
    }
    function playCurrentPage() {
        editor.removeAll();
        const root = $('#editor>span');
        root.children().each(function(){
            const animate = parseAnimate(this.dataset.animate);
            showAnimate(root, this, animate);
        });
    }

    exports('control', {
        initialize,
        updateValues,
        updatePositionSize,
        setTextStyle,
        setAnimate,
        playCurrentPage,
    });
});
