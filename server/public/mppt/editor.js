layui.define(['jquery', 'layer', 'utils', 'history', 'control', 'page', 'component'], function(exports) {
    const $ = layui.$;
    const utils = layui.utils;
    const layer = layui.layer;
    const history = layui.history;
    const control = layui.control;
    const animate = layui.animate;
    const component = layui.component;
    const page = layui.page;

    let action = { cmd: '' }; // 当前操作的对象
    let referents = []; // 当前选中的refrent列表
    let isAltKeyPress = false; // alt是否被按住
    let clickX = 0; // 保留上次的X轴位置
    let clickY = 0; // 保留上次的Y轴位置©
    let group = 0; // 集合的id最小值
    let copiedTarget = null; // 复制的target
    let editingTarget; // 正在编辑的target
    let doubleClickStartTime; // 双击计时
    let offset; // 编辑页面相对于body的偏移位置
    let root;


    function initialize() {
        root = document.getElementById('editor');
        const targets = $('#editor .target');
        const count = targets.length;
        targets.each((i, target)=>{
            target.style.zIndex = count-i-1;
            group = Math.max(group, +target.dataset.group||0);
        });
        offset = { x: root.offsetLeft + 3, y: root.offsetTop + 3 };
        page.initialize();
        control.initialize();
        component.initialize();
        history.initialize();
    }
    function getLocation(e) {
        return {
            x: (e.x || e.clientX) - offset.x,
            y: (e.y || e.clientY) - offset.y,
        }
    }
    function copyTargets() {
        let hasGroup = false;
        for (const refrent of referents) {
            const target = refrent.target;
            const newTarget = target.cloneNode(true);
            const oldId = target.getAttribute('id');
            newTarget.setAttribute('id', oldId);
            target.setAttribute('id', utils.uuid());
            target.parentNode.insertBefore(newTarget, target);
            if (!target.dataset.group) {
                if (!hasGroup) {
                    group++
                    hasGroup = true;
                }
            }
            if (hasGroup) {
                target.dataset.group = group;
            }
            component.update();
        }

    }
    function setClickTarget(target) {
        action.target = target;
        control.updateValues(target);
    }
    function resize(dir, location) {
        root.style.cursor = location + "_resize";
        const target = action.target;
        const referent = target.referent;
        switch (dir) {
            case "e": {
                const add_length = clickX - location.x;
                clickX = location.x;
                const length = parseInt(referent.style.width) - add_length;
                referent.style.width = length + "px";
                target.style.width = length + "px";
                break;
            }
            case "s": {
                const add_length = clickY - location.y;
                clickY = location.y;
                const length = parseInt(referent.style.height) - add_length;
                referent.style.height = length + "px";
                target.style.height = length + "px";
                break;
            }
            case "w": {
                const add_length = clickX - location.x;
                clickX = location.x;
                const length = parseInt(referent.style.width) + add_length;
                referent.style.width = length + "px";
                referent.style.left = clickX + "px";
                target.style.width = length + "px";
                target.style.left = (clickX + 1) + "px";
                break;
            }
            case "n":  {
                const add_length = clickY - location.y;
                clickY = location.y;
                const length = parseInt(referent.style.height) + add_length;
                referent.style.height = length + "px";
                referent.style.top = clickY + "px";
                target.style.height = length + "px";
                target.style.top = (clickY + 1) + "px";
                break;
            }
        }
    }
    function move(location) {
        const deltaX = clickX - location.x;
        const deltaY = clickY - location.y;
        for (const referent of referents) {
            referent.style.left = (referent.offsetLeft - deltaX) + "px";
            referent.style.top = (referent.offsetTop - deltaY) + "px";
            referent.target.style.top = (referent.offsetTop+1) + "px";
            referent.target.style.left = (referent.offsetLeft+1) + "px";
        }
        clickX = location.x;
        clickY = location.y;
    }
    function moveByStep(location) {
        for (const referent of referents) {
            referent.style.left = (referent.offsetLeft + location.x) + "px";
            referent.style.top = (referent.offsetTop + location.y) + "px";
            referent.target.style.top = (referent.offsetTop+1) + "px";
            referent.target.style.left = (referent.offsetLeft+1) + "px";
        }
        control.updatePositionSize(action.target);
        history.pushHistory('移动');
    }
    // 删除所有的referent
    function removeAllReferents() {
        const list = root.querySelectorAll('.referent');
        for (const el of list) {
            root.removeChild(el);
        }
        action.target = null;
        referents = [];
    }
    // 删除除了该组的其他所有的referent
    function removeOtherGroupReferents(group) {
        const list = root.querySelectorAll('.referent');
        for (const el of list) {
            if (el.dataset.group != group) {
                referents = referents.filter(o=>o!==el);
                root.removeChild(el);
            }
        }
    }
    // 为target创建一个referent
    function createReferentForTarget(target, group, isSelf) {
        const div = document.createElement("div");
        const dirs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
        const style = `height:${target.offsetHeight}px;width:${target.offsetWidth}px;top:${target.offsetTop-1}px;left:${target.offsetLeft-1}px`;
        const className = 'referent' + (group ? ' group' : '') + (isSelf ? ' self' : '');
        div.innerHTML = `<div data-group="${group||''}" class="${className}" style="${style}" onmousedown="onReferentMouseDown(event, 'move')">${dirs.map(dir=>(`<div class="referent_node" data-dir="${dir}" onmousedown="onReferentMouseDown(event, '${dir}')"></div>`)).join('')}</div>`;
        const referent = div.childNodes[0];
        referent.target = target;
        referent.active = (!group || isSelf);
        target.referent = referent;
        root.appendChild(referent);
        referents.push(referent);
        utils.log("create referent");
    };
    function clearAll(noUpdateComponent) {
        control.updateValues(); // 关闭属性窗口
        removeAllReferents();
        !noUpdateComponent && component.selectComponentLine();
        $('.no-animate-ext').hide();
        layer.closeAll();
    }
    function createReferents(target) {
        if (!isAltKeyPress) {
            removeAllReferents();
        }
        if (!target.dataset.group) {
            createReferentForTarget(target);
        } else {
            const list = root.querySelectorAll(`.target[data-group = "${target.dataset.group}"]`);
            for (const el of list) {
                createReferentForTarget(el, target.dataset.group, target === el);
            }
        }
    };
    function onReferentDoubleClick(target) {
        const isText = target.classList.contains('text');
        if (isText) {
            removeAllReferents();
            target.setAttribute("contenteditable", "true");
            editingTarget = target;
            action.editingTargetInnerText = target.innerText;
        } else {
            control.showImageSelect();
        }
    }
    function onReferentMouseDown(e, cmd) {
        const location = getLocation(e);
        clickY = location.y;
        clickX = location.x;
        action.cmd = cmd;
        action.from = 'referent';
        action.location = location;
        e.stopPropagation();
        if (cmd === 'move') {
            if (isAltKeyPress) {
                copyTargets();
            }
            if (Date.now() - doubleClickStartTime < 500) {
                onReferentDoubleClick(e.target.target);
                doubleClickStartTime = undefined;
            } else {
                doubleClickStartTime = Date.now();
            }
        }
        // 改变group的情况下被点中的target
        if (e.target.classList.contains('group')) {
            // 需要删除不是同一组的
            removeOtherGroupReferents(e.target.dataset.group);
            for (const referent of referents) {
                if (referent.classList.contains('self') && referent !== e.target) {
                    referent.classList.remove('self');
                }
            }
            if (!e.target.classList.contains('self')) {
                e.target.classList.add('self');
                setClickTarget(e.target.target);
            }
        }
    }
    function onDocumentMouseUp(e) {
        root.style.cursor = "auto";
        if (action.from === 'referent') {
            const location = getLocation(e);
            if (action.location.x !== location.x || action.location.y !== location.y) {
                history.pushHistory(action.cmd === 'move' ? '移动' : '改变大小');
            }
            action.from = undefined;
        }
    }
    function onDocumentMouseMove(e) {
        if (editingTarget) {
            return true;
        }
        if (action.from === 'referent') {
            let cmd = action.cmd;
            const location = getLocation(e);
            if (cmd === 'move') {
                move(location);
            } else {
                resize(cmd[0], location);
                cmd[1] && resize(cmd[1], location);
            }
            control.updatePositionSize(action.target);
            return false;
        }
    }
    function onDocumentMouseDown(e) {
        let target;
        if (editingTarget && e.target !== editingTarget) {
            if (!e.target.classList.contains('target')) {
                target = editingTarget;
            } else {
                target = e.target;
            }
            editingTargetEnd();
        } else if (e.target.classList.contains('target')) {
            if (e.target.getAttribute("contenteditable") !== 'true') {
                target = e.target;
            }
        }
        if (target) {
            selectTarget(target);
        }
        e.stopPropagation();
    }
    function selectTarget(target) {
        createReferents(target);
        setClickTarget(target);
        component.selectComponentLine(target.id);
    }
    function toggleTargetGroup() {
        if (referents.length < 2) {
            return;
        }
        // 判断所有的是否是同一个组，如果不是，则解散后再组合
        if (_.every(referents, o=>o.dataset.group === referents[0].dataset.group)){
            if (referents[0].dataset.group) {
                for (const refrent of referents) {
                    delete refrent.target.dataset.group;
                    delete refrent.dataset.group;
                    refrent.classList.remove('group');
                    refrent.classList.remove('self');
                }
                utils.log("delete group");
                history.pushHistory('解除组合');
            } else {
                group++;
                for (const refrent of referents) {
                    refrent.target.dataset.group = group;
                    refrent.classList.add('group');
                    refrent.dataset.group = group;
                    if (refrent.target === action.target) {
                        refrent.classList.add('self');
                    }
                }
                utils.log("add group");
                history.pushHistory('添加组合');
            }
        } else {
            group++;
            for (const refrent of referents) {
                refrent.target.dataset.group = group;
                refrent.classList.add('group');
                refrent.dataset.group = group;
                if (refrent.target === action.target) {
                    refrent.classList.add('self');
                } else {
                    refrent.classList.remove('self');
                }
            }
        }
    }
    function copyTargetAcctribute (target) {
        copiedTarget = target;
    }
    function pasteTargetAcctribute (target) {
        if (copiedTarget) {
            target.style.color = copiedTarget.style.color;
            target.style.fontWeight = copiedTarget.style.fontWeight;
            target.style.fontSize = copiedTarget.style.fontSize;
            target.style.fontStyle = copiedTarget.style.fontStyle;
        }
    }
    function editingTargetEnd() {
        editingTarget.setAttribute('contenteditable', 'false');
        if (editingTarget.innerText !== action.editingTargetInnerText) {
            history.pushHistory('改变文字内容');
        }
        editingTarget = undefined;
    }
    function createTextTarget() {
        clearAll();
        const zIndex = +((_.maxBy($('#editor .target'), o=>o.style.zIndex)||{}).style.zIndex||0)+1;
        const target = document.createElement('DIV');
        target.className = 'target text';
        target.style.position = 'absolute';
        target.style.left = '30px';
        target.style.top = '30px';
        target.style.width = '120px';
        target.style.height = '30px';
        target.style.zIndex = zIndex;
        target.innerHTML = '双击编辑文本内容';
        target.setAttribute('id', utils.uuid());
        root.appendChild(target);
        createReferentForTarget(target);
        action.target = target;
        control.updateValues(target);
        component.update();
    }
    function createImageTarget() {
        clearAll();
        const zIndex = +((_.maxBy($('#editor .target'), o=>o.style.zIndex)||{}).style.zIndex||0)+1;
        const target = document.createElement('IMG');
        target.className = 'target';
        target.style.position = 'absolute';
        target.style.left = '30px';
        target.style.top = '30px';
        target.style.width = '100px';
        target.style.height = '100px';
        target.style.zIndex = zIndex;
        target.setAttribute('src', 'mppt/default.svg');
        target.setAttribute('id', utils.uuid());
        root.appendChild(target);
        createReferentForTarget(target);
        action.target = target;
        control.updateValues(target);
        component.update();
    }
    function removeTargets() {
        for (const refrent of referents) {
            refrent.target.remove();
            component.update();
        }
        clearAll();
    }
    function onDocumentKeyDown(e) {
        utils.log("[onDocumentKeyDown]:", e.keyCode);
        if (referents.length) {
            if (e.keyCode === 27) { // esc
                clearAll();
            } else if ( e.keyCode === 37) { // left key
                moveByStep({ x: -1, y: 0 });
            } else if ( e.keyCode === 38) { // up key
                moveByStep({ x: 0, y: -1 });
            } else if (e.keyCode === 39) { // right key
                moveByStep({ x: 1, y: 0 });
            } else if (e.keyCode === 40) { // down key
                moveByStep({ x: 0, y: 1 });
            } else if (e.keyCode === 189 || e.keyCode === 187) { // - | +
                control.setTextStyle((target)=>{
                    let fontSize = parseInt(getComputedStyle(target).fontSize);
                    const step = e.keyCode === 189 ? 1 : -1;
                    const multiple = e.altKey ? 3 : 1;
                    fontSize =  fontSize + step * multiple;
                    fontSize < 5 && (fontSize = 5);
                    fontSize > 100 && (fontSize = 100);
                    target.style.fontSize = fontSize + 'px';
                    history.pushHistory('设置字体大小');
                });
            } else if (referents.length === 1) {
                const target = referents[0].target;
                if (e.altKey && e.keyCode === 86) { // alt + v 复制属性
                    copyTargetAcctribute(target);
                    utils.toast('复制属性成功');
                } else if (e.altKey && e.keyCode === 67) { // alt + c 粘贴属性
                    pasteTargetAcctribute(target);
                }
            } else {
                if (e.altKey && e.keyCode === 71) { // alt + g 切换group状态
                    toggleTargetGroup();
                }
            }
            if (e.altKey && e.keyCode === 8) { // alt + delete 删除元素
                removeTargets();
            }
        } else {
            if (e.keyCode === 27 || e.keyCode === 13) { // esc |  enter
                if (editingTarget) {
                    createReferents(editingTarget);
                    editingTargetEnd();
                }
            }
        }
        if (e.altKey && e.keyCode === 83) { // alt + s 保存
            page.savePage();
        } else if (e.altKey && e.keyCode === 72) { // alt + h 优化历史记录
            history.optimizeHistory();
        } else if (e.altKey && e.keyCode === 191) { // alt + ? 查看帮助
            page.showHelp();
        } else if (e.altKey && e.keyCode === 90) { // alt + z 回退
            history.popHistory();
        } else if (e.altKey && e.keyCode === 89) { // alt + y 取消回退
            history.recoverHistory();
        } else if (e.altKey && e.keyCode === 84) { // alt + t 添加文字元素
            createTextTarget();
        } else if (e.altKey && e.keyCode === 77) { // alt + m 添加图片元素
            createImageTarget();
        } else if (e.altKey && e.keyCode === 80) { // alt + p 预览本页
            animate.playCurrentPage();
        } else if (e.keyCode === 18) { // alt
            isAltKeyPress = true;
        }
    }
    function onDocumentKeyUp(e) {
        if (e.keyCode === 18) { // alt
            isAltKeyPress = false;
        }
    }

    // 导出函数
    exports('editor', {
        initialize,
        onDocumentMouseDown,
        onDocumentMouseMove,
        onDocumentMouseUp,
        onDocumentKeyDown,
        onDocumentKeyUp,
        clearAll,
        selectTarget,
        createImageTarget,
        createTextTarget,
        removeTargets,
        getRootHtml: () => root.innerHTML,
        setRootHtml: (html) => { root.innerHTML = html; },
        getAllReferents: () => referents,
        getReferents: () => referents.filter(o=>o.active),
        getAction: () => action,
    });

    // 全局函数
    window.onReferentMouseDown = onReferentMouseDown;
});
