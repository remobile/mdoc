layui.define(['jquery', 'layer', 'utils', 'control'], function(exports) {
    let editor;
    const $ = layui.$;
    const layer = layui.layer;
    const control = layui.control;
    const utils = layui.utils;

    function initialize() {
        editor = layui.editor;
        $('#componentButtonText').click(function(){
            editor.createTextTarget();
        });
        $('#componentButtonImage').click(function(){
            editor.createImageTarget();
        });
        $('#componentButtonRely').click(function(){
            // const action = editor.getAction();
            // if (action.target) {
            //     utils.unshiftUnique(animateRelyList, action.target);
            //     layer.tips('添加成功', '#componentButtonRely');
            // } else {
            //     layer.tips('没有选中元素', '#componentButtonRely');
            // }
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
    function getTargetHtml(target) {
        return target.classList.contains('text') ?
        `<i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()+'123123123123123'}</div>`
        :
        `<i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" />`;
    }
    function getComponentLine(target) {
        const id = target.getAttribute('id');
        return `<div class="component-line" data-id="${id}" onclick="window.onComponentLineClick('${id}')">${getTargetHtml(target)}</div>`;
    }
    function getReplyLine(target) {
        return `
        <div style="display:flex;">
        ${getTargetHtml(target)}
        </div>
        <div class="layui-btn-group">
            <button type="button" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe642;</i></button>
            <button type="button" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe640;</i></button>
        </div>
        `;
    }
    function add(target) {
        $('#componentContent').prepend(getComponentLine(target));
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
        getReplyLine,
    });

    // 全局函数
    window.onComponentLineClick = onComponentLineClick;
});
