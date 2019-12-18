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

    // 导出函数
    exports('history', {
        initialize,
        pushHistory,
        popHistory,
        recoverHistory,
        optimizeHistory,
    });

    // 全局函数
    window.setTopHistory = setTopHistory;
});
