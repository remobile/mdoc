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
    let showTemplate = false;

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
            handle: '.handle',
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
            if (!showTemplate && target.dataset.lock == 2) {
                return '';
            }
            return getComponentLine(target);
        });
        $('#componentContent').html(html.join(''));
    }
    function updateTargetOrder() {
        const ids = $.map($('#componentContent').children(), o=>o.dataset.id);
        $('#editor .target').each((i, target)=>{
            target.style.zIndex = ids.length - ids.indexOf(target.id) - 1;
        });
    }
    function getTargetHtml(target) {
        return target.classList.contains('text') ?
        `<div class="component-text">${target.innerHTML.trim()}</div>`
        :
        `<img  class="component-image" src="${target.getAttribute('src')}" />`;
    }
    function getComponentLine(target) {
        const id = target.id;
        const lock = target.dataset.lock;
        const className = `component-line${lock==1 ? ' lock' : lock==2 ? ' template' : ''}`;
        return `
        <div class="${className}" data-id="${id}" onmousedown="window.onComponentLineClick('${id}')">
            <i onmousedown="window.onToggleView(event, '${id}')" class="iconfont icon-noview"></i>
            <i class="layui-icon layui-icon-align-center${lock ? '' : ' handle'}"></i>
            ${getTargetHtml(target)}
            <i class="iconfont icon-lock" onmousedown="window.onLockClick('${id}')"></i>
        </div>
        `;
    }
    function selectComponentLine(id) {
        $('.component-line.select').removeClass('select');
        id && $('.component-line[data-id="'+id+'"]').addClass('select');
    }
    function onComponentLineClick(id) {
        const target = document.getElementById(id);
        if (!target.dataset.lock) {
            editor.selectTarget(target);
        } else {
            editor.clearAll();
            selectComponentLine(id);
        }
    }
    function onToggleView(event, id) {
        const target = document.getElementById(id);
        if (target.style.display !== 'none') {
            target.style.display = 'none';
            event.target.classList.remove('icon-noview');
            event.target.classList.add('icon-view');
        } else {
            target.style.display = 'block';
            event.target.classList.remove('icon-view');
            event.target.classList.add('icon-noview');
        }
        editor.clearAll();
        event.stopPropagation();
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
                content: `<div class="rely-list">${html}</div>`,
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
    function onLockClick(id) {
        const target = document.getElementById(id);
        const el = $('.component-line[data-id="'+id+'"]')[0];
        const lock = target.dataset.lock;
        if (lock == 1) {
            el.classList.remove('lock');
            delete target.dataset.lock;
        }
    }
    function toggleLock() {
        const el = $('.component-line.select')[0];
        if (el) {
            const id = el.dataset.id;
            const target = document.getElementById(id);
            const lock = target.dataset.lock;
            if (!lock) {
                el.classList.add('lock');
                target.dataset.lock = 1;
                editor.clearAll(true);
            } else if (lock == 1) {
                el.classList.remove('lock');
                el.classList.add('template');
                target.dataset.lock = 2;
            } else if (lock == 2) {
                el.classList.remove('template');
                delete target.dataset.lock;
                editor.selectTarget(target);
            }
        }
    }
    function toggleShowTemplate() {
        showTemplate = !showTemplate;
        update();
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
    window.onLockClick = onLockClick;
    window.onToggleView = onToggleView;
    window.showAnimateRelyComponent = showAnimateRelyComponent;
    window.setAnimateRelyComponent = setAnimateRelyComponent;
    window.removeAnimateRelyComponent = removeAnimateRelyComponent;
});
