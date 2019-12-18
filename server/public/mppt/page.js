layui.define(['jquery', 'utils'], function(exports) {
    let editor;
    let component;
    let animate;
    const $ = layui.$;
    const utils = layui.utils;
    let pages = []; // 页面列表
    let pageIndex = 0; // 当前页面的index
    let lastAction = {}; // 上一次操作的对象

    function initialize() {
        editor = layui.editor;
        component = layui.component;
        animate = layui.animate;
        utils.post('/getPages', (data)=>{
            pages = data.pages;
            pageIndex = data.index;
            update();
        });
        $('#pageButtonCopy').click(function(){
            copyPage();
        });
        $('#pageButtonDelete').click(function(){
            deletePage();
        });
        $('#pageButtonNew').click(function(){
            showHelp();
        });
        $('#pageButtonSetBackground').click(function(){
            showHelp();
        });
        $('#pageButtonHelp').click(function(){
            showHelp();
        });
    }
    function update() {
        const html = pages.map((page, index)=>{
            return getPageLine(page, index);
        });
        $('#pageContent').html(html.join(''));
    }
    function getPageLine(page, index) {
        return `
        <div class="page-line${index==pageIndex ? ' select' : ''}" data-index="${index}"  onmousedown="window.onPageLineClick(${index})">
            <i class="layui-icon layui-icon-align-center handle"></i>
            <div>${page.name}</div>
        </div>
        `;
    }
    function onPageLineClick(index) {
        pageIndex = index;
        $('.page-line.select').removeClass('select');
        $('.page-line[data-index="'+index+'"]').addClass('select');
        utils.post('/setPageIndex', { pageIndex }, ()=>{
            location.reload();
        });
    }
    function copyPage() {
        $('.page-line.select').removeClass('select');
        $('.page-line[data-index="'+pageIndex+'"]').addClass('select');
        utils.post('/copyPage', ()=>{
            location.reload();
        });
    }
    function deletePage() {
        $('.page-line.select').removeClass('select');
        $('.page-line[data-index="'+pageIndex+'"]').addClass('select');
        utils.post('/deletePage', ()=>{
            location.reload();
        });
    }
    function saveMarkdown() {
        const text = [];
        const list = _.sortBy($('#editor .target'), o=>-(o.style.zIndex||0));

        for (const el of list) {
            const id = el.id;
            const x = el.offsetLeft;
            const y = el.offsetTop;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            const isText = el.classList.contains('text');
            const type = !isText ? ' img' : '';
            let style = '';
            if (isText) {
                const fontSize = el.style.fontSize;
                if (fontSize) {
                    style = `${style}s=${parseFloat(fontSize)} `;
                }
                const fontWeight = el.style.fontWeight;
                if (fontWeight === 'bold') {
                    style = `${style}b `;
                }
                const fontStyle = el.style.fontStyle;
                if (fontStyle === 'italic') {
                    style = `${style}i `;
                }
                const color = el.style.color;
                if (color) {
                    style = `${style}c=${utils.rgbaToHex(color)} `;
                }
                const bgcolor = el.style.backgroundColor;
                if (bgcolor) {
                    style = `${style}bc=${utils.rgbaToHex(bgcolor)} `;
                }
                if (style) {
                    style = ` ${style.trim()}`;
                }
            }
            const group = el.dataset.group !== undefined ? ` g=${el.dataset.group}` : '';
            const _animate = el.dataset.animate !== undefined ? ` a=${el.dataset.animate}` : '';
            const lock = el.dataset.lock == 1 ? ' k' : el.dataset.lock == 2 ? ' t' : '';

            text.push(`::: fm${type}${lock} x=${x} y=${y} w=${w} h=${h}${style}${group}${_animate} id=${id}`);
            (el.src || el.innerText) && text.push(isText ? el.innerText : el.src.replace(window.location.href, ''));
            text.push(':::');
            text.push('');
        }
        utils.postPlain('/saveMarkdown', text.join('\n'));
        utils.toast('保存成功');
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
    exports('page', {
        initialize,
        saveMarkdown,
        showHelp,
    });

    // 全局函数
    window.onPageLineClick = onPageLineClick;
});
