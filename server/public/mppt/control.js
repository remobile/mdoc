layui.use('form', function(){
        var $ = layui.$;
        var form = layui.form;
        var slider = layui.slider;

        form.render();
        // 字体大小的滑块
        slider.render({
            elem: '#fontSizeSlider',
            value: 20,
            min: 9,
            max: 180,
        });
 });
