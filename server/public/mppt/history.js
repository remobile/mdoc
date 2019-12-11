layui.define(['jquery', 'utils'], function(exports){
    const $ = layui.$;
    const utils = layui.utils;
    let editor;
    let history = []; // 历史记录
    let historyIndex = 0; // 当前历史记录的指针

    function initialize() {
        editor = layui.editor;
        utils.post('/getHistory', '', (text)=>{
            if (!text) {
                history.push({ name: '创建文件', html: editor.root.innerHTML});
                historyIndex = 0;
            } else {
                history = JSON.parse(text);
                historyIndex = history.length - 1;
            }
            showHistory();
        });
    }
    function optimizeHistory() {
        const length = history.length;
        if (length > 20) {
            const ret = confirm(`是否优化历史记录，优化了之后不能再恢复，是否修复?`);
            let newHistory = [];
            if (ret) {
                for (let i = 0; i < length - 10; i += 10) {
                    newHistory.push(history[i]);
                }
                history = newHistory.concat(history.slice(history.length-10));
                historyIndex = history.length - 1;
                utils.post('/updateHistory', JSON.stringify(history));
                showHistory();
            }
        }
    }
    function setTopHistory(index) {
        historyIndex = index;
        editor.root.innerHTML = history[historyIndex].html;
        showHistory();
        removeAll();
    }
    function showHistory() {
        document.getElementById('historyContent').innerHTML = history.map((o, k)=>(
            `<div class="history-item"${k>historyIndex?' style="color:gray;" ':' '}onclick="window.setTopHistory(${k})">${k+1}. ${o.name}</div>`
        )).join('');
    }
    function pushHistory(name) {
        historyIndex++;
        history.length = historyIndex;
        history.push({ name, html: editor.root.innerHTML });
        // utils.post('/updateHistory', JSON.stringify(history));
        showHistory();
    }
    function popHistory() {
        if (history.length > 2) {
            historyIndex--;
            editor.root.innerHTML = history[historyIndex].html;
            removeAll();
        }
    }
    function recoverHistory() {
        if (history.length > historyIndex + 1) {
            historyIndex++;
            editor.root.innerHTML = history[historyIndex].html;
            removeAll();
        }
    }

    // 导出函数
    exports('history', {
        initialize,
        pushHistory,
        popHistory,
        recoverHistory,
    });

    // 全局函数
    window.setTopHistory = setTopHistory;
});
