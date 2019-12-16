layui.define(['layer'], function(exports) {
    const hasLog = true; // 是否有日志

    const options = {
        ANIMATE_DELAY: 0, //默认的动画延时
        ANIMATE_DURATION: 2, //默认的动画时长
        ANIMATE_TIMES: 1, //默认的动画播放次数
    };

    const layer = layui.layer;
    function log(...args) {
        hasLog && console.log(...args);
    }
    function toast(text) {
        layer.msg(text, { offset: 't', anim: 1 });
    }
    function unshiftUnique(list, item) {
        removeList(list, item).unshift(item);
        return list;
    }
    function pushUnique(list, item) {
        removeList(list, item).push(item);
        return list;
    }
    function removeList(list, item) {
        const index = list.indexOf(item);
        if (index !== -1) {
            list.splice(index, 1);
        }
        return list;
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
    //rgba(31,147,255,0.73)
    //rgb(31,147,255)
    function rgbaToHex(rgba) {
        var list = rgba.replace(/\s*/g, '').match(/rgba?\((\d+),(\d+),(\d+),?(.*)?\)/);
        if (list) {
            return `#${(+list[1]).toString(16).padStart(2, '0')}${(+list[2]).toString(16).padStart(2, '0')}${(+list[3]).toString(16).padStart(2, '0')}${((list[4]||1)*100).toString(16).padStart(2, '0')}`.toUpperCase();
        }
        return '';
    }
    //#1F93FF49
    function hexToRgba(hex) {
        const list = hex.match(/#(..)(..)(..)(..)?/);
        if (list) {
            return `rgba(${parseInt(list[1], 16)},${parseInt(list[2], 16)},${parseInt(list[3], 16)},${parseInt(list[4]||'64', 16)/100})`;
        }
        return '';
    }
    // 导出函数
    exports('utils', {
        options,
        log,
        toast,
        uuid,
        post,
        unshiftUnique,
        pushUnique,
        removeList,
        rgbaToHex,
        hexToRgba,
    });
});
