layui.define(['jquery', 'layer', 'utils', 'control', 'animate', 'history'], function(exports) {
    let editor;
    const $ = layui.$;
    const layer = layui.layer;
    const control = layui.control;
    const animate = layui.animate;
    const history = layui.history;
    const utils = layui.utils;
    let animateRelyList = [];
    let relyDialog;

    function initialize() {
        editor = layui.editor;
        $('#componentButtonText').click(function(){
            editor.createTextTarget();
        });
        $('#componentButtonImage').click(function(){
            editor.createImageTarget();
        });
        $('#componentButtonDelete').click(function(){
            editor.removeTargets();
        });
        $('#componentButtonToggleLock').click(function(){
            toggleLock();
        });
        $('#componentButtonToggleShow').click(function(){
            toggleShowTemplate();
        });
        update();
        Sortable.create(document.getElementById('componentContent'), {
            animation: 150,
            ghostClass: 'blue-background-class',
            onUpdate: function() {
                updateTargetOrder();
                history.pushHistory('改变组件顺序');
            },
        });
    }
    function update() {
        animateRelyList = [];
        const html = _.sortBy($('#editor .target'), o=>-(o.style.zIndex||0)).map(target=>{
            animateRelyList.push(target);
            return getComponentLine(target);
        });
        $('#componentContent').html(html);
    }
    function updateTargetOrder() {
        const ids = $.map($('#componentContent').children(), o=>o.dataset.id);
        $('#editor .target').each((i, target)=>{
            target.style.zIndex = ids.length - ids.indexOf(target.id) - 1;
        });
    }
    function getTargetHtml(target) {
        return target.classList.contains('text') ?
        `<i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()}</div>`
        :
        `<i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" />`;
    }
    function getComponentLine(target) {
        const id = target.getAttribute('id');
        return `<div class="component-line" data-id="${id}" onmousedown="window.onComponentLineClick('${id}')">${getTargetHtml(target)}</div>`;
    }
    function selectComponentLine(id) {
        $('.component-line.select').removeClass('select');
        $('.component-line[data-id="'+id+'"]').addClass('select');
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
            const html = animateRelyList.filter(target=>target.id!==action.target.id).map(target=>{
                return getRelyLine(target);
            }).join('');
            relyDialog = layer.open({
                type: 1,
                title: '选择动画依赖组件',
                offset: ['290px', '30px'], //位置
                area: ['240px', '500px'], //宽高
                content: `<div>${html}</div>`,
            });
        }
    }
    function setAnimateRelyComponent(id) {
        animate.setAnimate({ rely: id });
        utils.unshiftUnique(animateRelyList, document.getElementById(id));
        layer.close(relyDialog);
    }
    function removeAnimateRelyComponent() {
        animate.setAnimate({ rely: '' });
    }

    // 导出函数
    exports('component', {
        initialize,
        update,
        getRelyItem,
        selectComponentLine,
    });

    // 全局函数
    window.onComponentLineClick = onComponentLineClick;
    window.showAnimateRelyComponent = showAnimateRelyComponent;
    window.setAnimateRelyComponent = setAnimateRelyComponent;
    window.removeAnimateRelyComponent = removeAnimateRelyComponent;
});
