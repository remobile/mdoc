layui.define(['jquery', 'layer', 'utils', 'control'], function(exports) {
    let editor;
    const $ = layui.$;
    const layer = layui.layer;
    const control = layui.control;
    const utils = layui.utils;
    const animateRelyList = [];
    let dialog;

    function initialize() {
        editor = layui.editor;
        $('#componentButtonText').click(function(){
            editor.createTextTarget();
        });
        $('#componentButtonImage').click(function(){
            editor.createImageTarget();
        });
        $('#componentButtonRely').click(function(){

        });
        $('#componentButtonDelete').click(function(){
            // const action = editor.getAction();
            // if (action.target) {
            //
            //     layer.tips('添加成功', '#componentButtonRely');
            // } else {
            //     layer.tips('没有选中元素', '#componentButtonRely');
            // }
        });
        $('#componentButtonPlay').click(function(){

        });
        const html = $.map($('.target'), target=>{
            animateRelyList.push(target);
            return getComponentLine(target);
        });
        $('#componentContent').html(html);
    }
    function getTargetHtml(target) {
        return target.classList.contains('text') ?
        `<i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()}</div>`
        :
        `<i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" />`;
    }
    function getComponentLine(target) {
        const id = target.getAttribute('id');
        return `<div class="component-line" data-id="${id}" onclick="window.onComponentLineClick('${id}')">${getTargetHtml(target)}</div>`;
    }
    function add(target) {
        utils.unshift(animateRelyList, target);
        $('#componentContent').prepend(getComponentLine(target));
    }
    function remove(target) {
        utils.removeList(animateRelyList, target);
        $(`.component-line[data-id="${target.id}"]`).remove();
    }
    function onComponentLineClick(id) {
        editor.selectTarget(document.getElementById(id));
    }
    function getRelyLine(target) {
        const id = target.getAttribute('id');
        return `<div class="component-line" data-id="${id}" onclick="window.setAnimateRelyComponent('${id}')">${getTargetHtml(target)}</div>`;
    }
    function getRelyItem(targetId) {
        if (targetId) {
            const target = document.getElementById(targetId);
            return `
            <div style="display:flex;align-items: center;">
                ${getTargetHtml(target)}
            </div>
            <div class="layui-btn-group">
                <button onclick="window.showAnimateRelyComponent()" type="button" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe642;</i></button>
                <button onclick="window.removeAnimateRelyComponent()" type="button" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe640;</i></button>
            </div>
            `
        }
        return `
        无
        <div class="layui-btn-group">
            <button onclick="window.showAnimateRelyComponent()" type="button" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe654;</i></button>
        </div>
        `
    }
    function useRelyComponent(target) {
         utils.unshiftUnique(animateRelyList, target);
    }
    function showAnimateRelyComponent() {
        const action = editor.getAction();
        if (action.target) {
            const html = animateRelyList.map(target=>{
                return getRelyLine(target);
            }).join('');
            dialog = layer.open({
                type: 1,
                title: '选择动画依赖组件',
                offset: ['290px', '30px'], //位置
                area: ['240px', '500px'], //宽高
                content: `<div>${html}</div>`,
            });
        }
    }
    function setAnimateRelyComponent(id) {
        control.setAnimate({ rely: id });
        utils.unshiftUnique(animateRelyList, document.getElementById(id));
        layer.close(dialog);
    }
    function removeAnimateRelyComponent() {
        control.setAnimate({ rely: '' });
    }

    // 导出函数
    exports('component', {
        initialize,
        add,
        remove,
        getRelyItem,
    });

    // 全局函数
    window.onComponentLineClick = onComponentLineClick;
    window.showAnimateRelyComponent = showAnimateRelyComponent;
    window.setAnimateRelyComponent = setAnimateRelyComponent;
    window.removeAnimateRelyComponent = removeAnimateRelyComponent;
});
