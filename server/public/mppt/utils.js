layui.define(function(exports) {
    const hasLog = true; // 是否有日志

    function log(...args) {
        hasLog && console.log(...args);
    }
    function uuid() {
        return Math.random().toString().substr(2, 2)
        + Math.random().toString().substr(2, 2)
        + Date.now().toString(36)
        + Math.random().toString().substr(2, 2)
        + Math.random().toString().substr(2, 2);
    }
    function post (url, data, fn) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                fn && fn.call(this, xhr.responseText);
            }
        };
        xhr.send(data);
    }
    // 导出函数
    exports('utils', {
        log,
        uuid,
        post,
    });
});
