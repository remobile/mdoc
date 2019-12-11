layui.define(['jquery'], function(exports) {
    let editor;
    const $ = layui.$;
    function initialize() {
        editor = layui.editor;
        update();
    }
    function update() {
        const html = $.map($('.target'), target=>{
            const isText = target.classList.contains('text');
            const id = target.getAttribute('id');
            const html = isText ?
            `<i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()}<div>`
            :
            `<i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" />`;
            return `<div class="component-line" onclick="window.onComponentLineClick('${id}')">${html}</div>`
        });
        $('#componentContent').html(html);
    }
    function onComponentLineClick(id) {
        editor.selectTarget(document.getElementById(id));
    }

    // 导出函数
    exports('component', {
        initialize,
        update,
    });

    // 全局函数
    window.onComponentLineClick = onComponentLineClick;
});
