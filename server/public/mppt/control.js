layui.use(['form', 'colorpicker'], function(){
        var $ = layui.$;
        var form = layui.form;
        var slider = layui.slider;
        var colorpicker = layui.colorpicker;

        form.render();
        // 字体大小的滑块
        slider.render({
            elem: '#fontSizeSlider',
            value: 20,
            min: 9,
            max: 180,
            change: function(value){
                setTargetFontSize(value);
            },
        });
        // 行距的滑块
        slider.render({
            elem: '#lineHeightSlider',
            value: 20,
            min: 9,
            max: 180,
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
