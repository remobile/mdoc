layui.define(['jquery', 'layer', 'utils', 'control', 'history'], function(exports) {
    let editor;
    const $ = layui.$;
    const layer = layui.layer;
    const control = layui.control;
    const history = layui.history;
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
        $('#componentButtonDelete').click(function(){
            editor.removeTargets();
        });
        $('#componentButtonHistory').click(function(){
            history.optimizeHistory();
        });
        $('#componentButtonPlay').click(function(){
            control.playCurrentPage();
        });
        $('#componentButtonHelp').click(function(){
            showHelp();
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
        animateRelyList.unshift(target);
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
            const html = animateRelyList.filter(target=>target.id!==action.target.id).map(target=>{
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
    function showHelp() {
        layer.open({
            type: 1,
            title: '帮助',
            offset: ['100px', '500px'], //位置
            area: ['440px', '600px'], //宽高
            content: `
            <div id="help">
                <div class="title">基础用法：</div>
                <div><span>选择元素:</span> 鼠标点击选择元素，按住alt，可以选择多个元素，按esc取消选择</div>
                <div><span>移动元素:</span> 选中元素用鼠标拖动位置，改变大小，使用上下左右键微调</div>
                <div><span>复制元素:</span> 按住alt，用鼠标拖动选中的元素进行复制</div>
                <div><span>字体大小:</span> +或-微调字体大小，按住alt快速微调</div>
                <div class="title">快捷键：</div>
                <div><span>alt+g:</span> 合并组和拆开组</div>
                <div><span>alt+t:</span> 添加文字元素</div>
                <div><span>alt+i:</span> 添加图片元素</div>
                <div><span>alt+c:</span> 复制元素属性</div>
                <div><span>alt+v:</span> 粘贴元素属性</div>
                <div><span>alt+z:</span> 回滚历史操作</div>
                <div><span>alt+y:</span> 取消回滚历史</div>
                <div><span>alt+h:</span> 优化历史记录</div>
                <div><span>alt+s:</span> 保存文件至md</div>
            </div>`,
        });
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
