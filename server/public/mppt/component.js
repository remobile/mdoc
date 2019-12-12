layui.define(['jquery'], function(exports) {
    let editor;
    const $ = layui.$;
    function initialize() {
        editor = layui.editor;
        $('#componentButtonText').click(function(){
            editor.createTextTarget();
        });
        $('#componentButtonImage').click(function(){
            editor.createImageTarget();
        });
        $('#componentButtonRelate').click(function(){

        });
        $('#componentButtonDelete').click(function(){

        });
        $('#componentButtonPlay').click(function(){

        });
        const html = $.map($('.target'), target=>{
            return getComponentLine(target);
        });
        $('#componentContent').html(html);
    }
    function getComponentLine(target) {
        const isText = target.classList.contains('text');
        const id = target.getAttribute('id');
        const html = isText ?
        `<i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()}<div>`
        :
        `<i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" />`;
        return `<div class="component-line" data-id="${id}" onclick="window.onComponentLineClick('${id}')">${html}</div>`;
        return html;
    }
    function add(target) {
        $('#componentContent').append(getComponentLine(target));
    }
    function remove(target) {
        $(`.component-line[data-id="${target.id}"]`).remove();
    }
    function onComponentLineClick(id) {
        editor.selectTarget(document.getElementById(id));
    }

    // 导出函数
    exports('component', {
        initialize,
        add,
        remove,
    });

    // 全局函数
    window.onComponentLineClick = onComponentLineClick;
});
