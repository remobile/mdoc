layui.use(['form', 'colorpicker'], function() {
        const $ = layui.$;
        const form = layui.form;
        const slider = layui.slider;
        const colorpicker = layui.colorpicker;

        form.render();
        // 更新属性的值
        controls.updateValues = function (target) {
            const isText = target.classList.contains('text');
            if (isText) {
                // 字体大小
                let fontSize = parseInt(getComputedStyle(target).fontSize);
                controls.fontSizeSlider.setValue(fontSize - 9);
                // 行距
                let lineHeight = target.style.lineHeight;
                if (lineHeight === 'normal') {
                    lineHeight = 1.23;
                } else {
                    lineHeight = parseInt(lineHeight);
                }
                controls.lineHeightSlider.setValue(lineHeight * 100 - 80);
            }
        };
        // 字体大小的滑块
        controls.fontSizeSlider = slider.render({
            elem: '#fontSizeSlider',
            value: 20,
            min: 9,
            max: 180,
            change: function(fontSize){
                if (referents.length) {
                    for (const referent of referents) {
                        const target = referent.target;
                        if (target.classList.contains('text')) {
                            target.style.fontSize = fontSize + 'px';
                        }
                    }
                }
            },
        });
        // 行距的滑块
        controls.lineHeightSlider = slider.render({
            elem: '#lineHeightSlider',
            value: 123,
            min: 80,
            max: 800,
            change: function(lineHeight){
                if (referents.length) {
                    for (const referent of referents) {
                        const target = referent.target;
                        if (target.classList.contains('text')) {
                            target.style.lineHeight = lineHeight / 100;
                        }
                    }
                }
            },
        });
        // 颜色选择器
        colorpicker.render({
            elem: '#textColor',
            color: 'rgba(7, 155, 140, 1)',
            format: 'rgb',
            predefine: true,
            alpha: true,
            done: function(color){
                $('#textColorPicker').val(color); //向隐藏域赋值
                console.log("=======", color);
            },
            change: function(color){
                console.log("=======", color);
            },
        });
        // 背景颜色选择器
        colorpicker.render({
            elem: '#textBackgroundColor',
            color: 'rgba(7, 155, 140, 1)',
            format: 'rgb',
            predefine: true,
            alpha: true,
            done: function(color){
                $('#textBackgroundColorPicker').val(color); //向隐藏域赋值
                console.log("=======", color);
            },
            change: function(color){
                console.log("=======", color);
            },
        });
 });
