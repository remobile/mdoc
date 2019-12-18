layui.define(['jquery', 'utils'], function(exports) {
    let editor;
    let component;
    let animate;
    const $ = layui.$;
    const utils = layui.utils;
    let page = []; // 历史记录
    let pageIndex = 0; // 当前历史记录的指针
    let lastAction = {}; // 上一次操作的对象

    function initialize() {
        editor = layui.editor;
        component = layui.component;
        animate = layui.animate;
        utils.post('/getHistory', '', (text)=>{
            if (!text) {
                page.push({ name: '创建文件', html: editor.getRootHtml()});
                pageIndex = 0;
            } else {
                page = JSON.parse(text);
                pageIndex = page.length - 1;
            }
            showHistory();
        });
        $('#pageButtonBack').click(function(){
            popHistory();
        });
        $('#pageButtonForward').click(function(){
            recoverHistory();
        });
        $('#pageButtonHistory').click(function(){
            optimizeHistory();
        });
        $('#pageButtonPlay').click(function(){
            animate.playCurrentPage();
        });
        $('#pageButtonHelp').click(function(){
            showHelp();
        });
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
        showHelp,
    });

    // 全局函数
    // window.setTopHistory = setTopHistory;
});
