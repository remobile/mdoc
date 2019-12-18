layui.define(['jquery', 'utils'], function(exports) {
    let editor;
    let component;
    let animate;
    const $ = layui.$;
    const utils = layui.utils;
    let history = []; // 历史记录
    let historyIndex = 0; // 当前历史记录的指针
    let lastAction = {}; // 上一次操作的对象

    function initialize() {
        editor = layui.editor;
        component = layui.component;
        animate = layui.animate;
        utils.post('/getHistory', '', (data)=>{
            if (!data) {
                history.push({ name: '创建文件', html: editor.getRootHtml()});
                historyIndex = 0;
            } else {
                history = data;
                historyIndex = history.length - 1;
            }
            showHistory();
        });
        $('#historyButtonBack').click(function(){
            popHistory();
        });
        $('#historyButtonForward').click(function(){
            recoverHistory();
        });
        $('#historyButtonHistory').click(function(){
            optimizeHistory();
        });
        $('#historyButtonPlay').click(function(){
            animate.playCurrentPage();
        });
        $('#historyButtonHelp').click(function(){
            showHelp();
        });
    }
    function optimizeHistory() {
        const length = history.length;
        if (length > 0) {
            const dialog = layer.confirm('优化历史记录了之后不能再恢复，是否继续?', {
                btn: ['继续','放弃']
            }, function(){
                let newHistory = [];
                for (let i = 0; i < length - 10; i += 10) {
                    newHistory.push(history[i]);
                }
                history = newHistory.concat(history.slice(history.length-10));
                historyIndex = history.length - 1;
                // utils.post('/updateHistory', history);
                showHistory();
                layer.close(dialog);
                utils.toast('优化成功');
            });
        }
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="history-item"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}. ${o.name}</div>`
        )).join('');
    }
    function pushHistory(name) {
        const action = editor.getAction();
        if (!(lastAction.target === action.target && lastAction.name === name)) {
            lastAction.target = action.target;
            lastAction.name = name;

            historyIndex++;
            history.length = historyIndex;
            history.push({ name, html: editor.getRootHtml() });
            // utils.post('/updateHistory', JSON.stringify(history));
            showHistory();
        }
    }
    function setTopHistory(index) {
        historyIndex = index;
        editor.setRootHtml(history[historyIndex].html);
        showHistory();
        component.update();
        editor.clearAll();
    }
    function popHistory() {
        if (historyIndex > 0) {
            setTopHistory(historyIndex - 1);
        }
    }
    function recoverHistory() {
        if (history.length > historyIndex + 1) {
            setTopHistory(historyIndex + 1);
        }
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
    exports('history', {
        initialize,
        pushHistory,
        popHistory,
        recoverHistory,
        optimizeHistory,
        showHelp,
    });

    // 全局函数
    window.setTopHistory = setTopHistory;
});
