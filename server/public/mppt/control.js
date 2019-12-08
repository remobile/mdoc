layui.use(['form', 'colorpicker'], function() {
        const $ = layui.$;
        const form = layui.form;
        const slider = layui.slider;
        const colorpicker = layui.colorpicker;
        const settings = layui.data('settings');
        const textColorList = [...(settings.textColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textColorList.length > 22 && ( textColorList.length = 22 );
        const textBackgroundColorList = [...(settings.textBackgroundColorList || []), '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700','#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'];
        textBackgroundColorList.length > 22 && ( textBackgroundColorList.length = 22 );

        // form.render();
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
            if (referents.length) {
                for (const referent of referents) {
                    const target = referent.target;
                    if (!target.classList.contains('text')) {
                        callback(target);
                    }
                }
            }
        }

        // 更新属性的值
        controls.updateValues = function (target) {
            if (!target) {
                $('#textPropertyPanel').hide();
                $('#imagePropertyPanel').hide();
                $('#animatePanel').hide();
                return;
            }
            const isText = target.classList.contains('text');
            if (isText) {
                $('#textPropertyPanel').show();
                $('#animatePanel').show();
                const style = getComputedStyle(target);
                // 字体大小
                let fontSize = parseInt(style.fontSize);
                controls.fontSizeSlider = slider.render({
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
                controls.lineHeightSlider = slider.render({
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
            } else {
                $('#imagePropertyPanel').show();
                $('#animatePanel').show();
                const style = getComputedStyle(target);
                // 宽
                let width = parseInt(style.width);
                controls.imageWidthSlider = slider.render({
                    elem: '#imageWidthSlider',
                    value: width,
                    min: 0,
                    max: 800,
                    done: function(width){
                        console.log("=======", width);
                    },
                    change: function(width){
                        setImageStyle((target)=>{
                            target.style.width = width + 'px';
                        });
                    },
                });
                // 高
                let height = parseInt(style.height);
                controls.imageHeightSlider = slider.render({
                    elem: '#imageHeightSlider',
                    value: height,
                    min: 0,
                    max: 1000,
                    done: function(height){
                        console.log("=======", height);
                    },
                    change: function(height){
                        setImageStyle((target)=>{
                            target.style.width = height + 'px';
                        });
                    },
                });
            }
        };
 });
