layui.define(['jquery', 'utils', 'history', 'control', 'component'], function(exports) {
    const $ = layui.$;
    const utils = layui.utils;
    const history = layui.history;
    const control = layui.control;
    const component = layui.component;

    let action = null; // 当前操作的对象
    let lastAction = null; // 上一次操作的对象
    let referents = []; // 当前选中的refrent列表
    let isAltKeyPress = false; // alt是否被按住
    let clickX = 0; // 保留上次的X轴位置
    let clickY = 0; // 保留上次的Y轴位置©
    let group = -1; // 集合的id最小值
    let copiedTarget = null; // 复制的target
    let animateSelector = null; //动画选择器
    let targetTextInput = null; //输入框
    let root;
    let doubleClickStartTime; // 双击计时
    let clickTarget; // 被选中的target
    let editingTarget; // 正在编辑的target

    const OFFSET = { x: 300, y: 4 }; // 编辑页面相对于body的偏移位置


    function initialize() {
        root = document.getElementById('editor');
        control.initialize();
        component.initialize();
        history.initialize();
        const list = document.querySelectorAll('.target');
        for (const el of list) {
            group = Math.max(group, +el.dataset.group||0);
        }
    }
    function getLocation(e) {
        return {
            x: (e.x || e.clientX) - OFFSET.x,
            y: (e.y || e.clientY) - OFFSET.y,
        }
    }
    function copyTarget(target) {
        const newTarget = target.cloneNode(true);
        const oldId = target.getAttribute('id');
        newTarget.setAttribute('id', oldId);
        target.setAttribute('id', uuid());
        target.parentNode.insertBefore(newTarget, target);
    }
    function setClickTarget(target) {
        lastClickTarget = clickTarget;
        clickTarget = target;
        control.updateValues(target);
    }
    function resize(referent, type, location) {
        root.style.cursor = location + "_resize";
        switch (type) {
            case "e": {
                const add_length = clickX - location.x;
                clickX = location.x;
                const length = parseInt(referent.style.width) - add_length;
                referent.style.width = length + "px";
                referent.target.style.width = length + "px";
                break;
            }
            case "s": {
                const add_length = clickY - location.y;
                clickY = location.y;
                const length = parseInt(referent.style.height) - add_length;
                referent.style.height = length + "px";
                referent.target.style.height = length + "px";
                break;
            }
            case "w": {
                const add_length = clickX - location.x;
                clickX = location.x;
                const length = parseInt(referent.style.width) + add_length;
                referent.style.width = length + "px";
                referent.style.left = clickX + "px";
                referent.target.style.width = length + "px";
                referent.target.style.left = (clickX + 1) + "px";
                break;
            }
            case "n":  {
                const add_length = clickY - location.y;
                clickY = location.y;
                const length = parseInt(referent.style.height) + add_length;
                referent.style.height = length + "px";
                referent.style.top = clickY + "px";
                referent.target.style.height = length + "px";
                referent.target.style.top = (clickY + 1) + "px";
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
        history.pushHistory('移动结束');
    }
    // 删除所有的referent
    function removeAllReferents() {
        const list = root.querySelectorAll('.referent');
        for (const el of list) {
            root.removeChild(el);
        }
        editingTarget = null;
        referents = [];
    }
    // 为target创建一个referent
    function createReferentForTarget(target, isGroup, isSelf) {
        const div = document.createElement("div");
        const dirs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
        const style = `height:${target.offsetHeight}px;width:${target.offsetWidth}px;top:${target.offsetTop-1}px;left:${target.offsetLeft-1}px`;
        const className = 'referent' + (isGroup ? ' group' : '') + (isSelf ? ' self' : '');
        div.innerHTML = `<div class="${className}" style="${style}" onmousedown="onReferentMouseDown(event, 'move')">${dirs.map(dir=>(`<div class="referent_node" data-dir="${dir}" onmousedown="onReferentMouseDown(event, '${dir}')"></div>`)).join('')}</div>`;
        const referent = div.childNodes[0];
        referent.target = target;
        root.appendChild(referent);
        referents.push(referent);
        utils.log("create referent");
    };
    function removeAll() {
        control.updateValues(); // 关闭属性窗口
        removeAllReferents();
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
                createReferentForTarget(el, true, target === el);
            }
        }
    };

    function onReferentDoubleClick(target) {
        const isText = target.classList.contains('text');
        if (isText) {
            removeAllReferents();
            target.setAttribute("contenteditable", "true");
            editingTarget = target;
        }
    }
    function onReferentMouseDown(e, type) {
        const location = getLocation(e);
        clickY = location.y;
        clickX = location.x;
        action = {
            type: type,
            referent: type === 'move' ? e.target : e.target.parentNode,
            target: type === 'move' ? e.target.target : e.target.parentNode.target,
        };
        e.stopPropagation();
        isAltKeyPress && type === 'move' && copyTarget(e.target.target);
        if (Date.now() - doubleClickStartTime < 200) {
            onReferentDoubleClick(e.target.target);
            doubleClickStartTime = undefined;
        } else {
            doubleClickStartTime = Date.now();
        }
        // 改变group的情况下被点中的target
        if (e.target.classList.contains('group')) {
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
    function onDocumentMouseUp() {
        root.style.cursor = "auto";
        if (action) {
            if (!(lastAction && lastAction.target === action.target &&  lastAction.type === action.type)) {
                history.pushHistory(action.type === 'move' ? '移动' : '改变大小');
            }
            lastAction = action;
            action = null;
        }
    }
    function onDocumentMouseMove(e) {
        if (editingTarget) {
            return true;
        }
        if (action) {
            const type = action.type;
            const location = getLocation(e);
            if (type === 'move') {
                move(location);
            } else {
                const referent = action.referent;
                resize(referent, type[0], location);
                type[1] && resize(referent, type[1], location);
            }
            control.updatePositionSize(clickTarget);
        }
        return false;
    }
    function selectTarget(target) {
        createReferents(target);
        setClickTarget(target);
    }
    function onDocumentMouseDown(e) {
        let target;
        if (editingTarget && e.target !== editingTarget) {
            editingTarget.setAttribute('contenteditable', 'false');
            if (!e.target.classList.contains('target')) {
                target = editingTarget;
            } else {
                target = e.target;
            }
            editingTarget = undefined;
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
    function toggleTargetGroup() {
        if (referents.length < 2) {
            return;
        }
        if (referents[0].target.dataset.group === undefined) {
            group++;
            for (const refrent of referents) {
                refrent.target.dataset.group = group;
                refrent.classList.add('group');
                if (refrent.target === clickTarget) {
                    refrent.classList.add('self');
                }
            }
            utils.log("add group");
            history.pushHistory('添加组合');
        } else {
            for (const refrent of referents) {
                delete refrent.target.dataset.group;
                refrent.classList.remove('group');
            }
            utils.log("delete group");
            history.pushHistory('解除组合');
        }
    }
    function saveMarkdown(e) {
        const text = [];
        const list = root.querySelectorAll('.target');
        for (const el of list) {
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
                    style = `${style}font-size:${fontSize};`;
                }
                const fontWeight = el.style.fontWeight;
                if (fontWeight) {
                    style = `${style}font-weight:${fontWeight};`;
                }
                const fontStyle = el.style.fontStyle;
                if (fontStyle === 'italic') {
                    style = `${style}font-style:${fontStyle};`;
                }
                const color = el.style.color;
                if (color) {
                    style = `${style}color:${color};`;
                }
                const bgcolor = el.style.backgroundColor;
                if (bgcolor) {
                    style = `${style}background-color:${bgcolor};`;
                }
                if (style) {
                    style = ` style=${style.replace(/\s/g, '')}`;
                }
            }
            const group = el.dataset.group !== undefined ? ` group=${el.dataset.group}` : '';
            const animate = el.dataset.animate !== undefined ? ` animate=${el.dataset.animate}` : '';

            text.push(`::: fm${type} x=${x} y=${y} w=${w} h=${h}${style}${group}${animate}`);
            (el.src || el.innerText) && text.push(isText ? el.innerText : el.src);
            text.push(':::');
            text.push('');
        }
        utils.post('/saveMarkdown', text.join('\n'));
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
    function setFragmentAnimate (target, referent) {
        if (animateSelector) {
            removeAnimateSelector();
            return;
        }
        const animates = [
            { value: 'grow', name: 'grow' },
            { value: 'zoom-in', name: 'zoom' },
            { value: 'fade-out', name: 'fade-out' },
            { value: 'fade-up', name: 'fade-up' },
            { value: 'fade-down', name: 'fade-down' },
            { value: 'fade-right', name: 'fade-right' },
            { value: 'fade-left', name: 'fade-left' },
            { value: 'semi-fade-out', name: 'semi-fade-out' },
            { value: 'fade-in-then-out', name: 'fade-in-then-out' },
            { value: 'fade-in-then-semi-out', name: 'fade-in-then-semi-out' },
            { value: 'shrink', name: 'shrink' },
            { value: 'strike', name: 'strike' },
            { value: 'highlight-red', name: 'highlight-red' },
            { value: 'highlight-current-red', name: 'highlight-current-red' },
            { value: 'highlight-current-green', name: 'highlight-current-green' },
            { value: 'highlight-green', name: 'highlight-green' },
            { value: 'highlight-current-blue', name: 'highlight-current-blue' },
            { value: 'highlight-blue', name: 'highlight-blue' },
        ];
        animateSelector = document.createElement('DIV');
        animateSelector.style.position = 'absolute';
        animateSelector.style.left = (referent.offsetLeft +referent.offsetWidth) + "px";
        animateSelector.style.top = referent.offsetTop + "px";
        document.body.appendChild(animateSelector);
        animateSelector.innerHTML = `<select id="animate-select">${animates.map(o=>`<option value ="${o.value}" ${o.value===target.dataset.animate?'selected':''}>${o.name}</option>`)}</select>`;
        document.getElementById('animate-select').onchange = function(e) {
            const index = e.target.selectedIndex;
            const value = e.target.options[index].value;
            target.dataset.animate = value;
            document.body.removeChild(animateSelector);
            animateSelector = null;
        };
    }
    function removeAnimateSelector () {
        if (animateSelector) {
            document.body.removeChild(animateSelector);
            animateSelector = null;
        }
    }
    function editTargetText (target, referent) {
        if (targetTextInput) {
            removeTargetTextInput();
            return;
        }
        const isText = target.classList.contains('text');
        targetTextInput = document.createElement('INPUT');
        targetTextInput.type = 'text';
        targetTextInput.value = isText ? target.innerText : target.src.replace(window.location.href, '');
        targetTextInput.className = 'target_input';
        targetTextInput.style.left = (referent.offsetLeft +referent.offsetWidth) + "px";
        targetTextInput.style.top = referent.offsetTop + "px";
        document.body.appendChild(targetTextInput);
        targetTextInput.oninput = function(e) {
            if (isText) {
                target.innerText = e.target.value;
            } else {
                target.src = e.target.value;
            }
        };
    }
    function removeTargetTextInput() {
        if (targetTextInput) {
            document.body.removeChild(targetTextInput);
            targetTextInput = null;
        }
    }
    function createTextTarget() {
        const target = document.createElement('DIV');
        target.className = 'target text';
        target.style.position = "absolute";
        target.style.left = "30px";
        target.style.top = "30px";
        target.style.width = "100px";
        target.style.height = "30px";
        target.setAttribute('id', uuid());
        root.appendChild(target);
        createReferentForTarget(target);
    }
    function createImageTarget() {
        const target = document.createElement('IMG');
        target.className = 'target';
        target.style.position = "absolute";
        target.style.left = "30px";
        target.style.top = "30px";
        target.style.width = "100px";
        target.style.height = "100px";
        target.setAttribute('id', uuid());
        root.appendChild(target);
        createReferentForTarget(target);
    }
    function removeTarget(target) {
        target.remove();
        removeAll();
    }
    function removeTargets(referents) {
        for (const refrent of referents) {
            refrent.target.remove();
        }
        removeAll();
    }
    function onDocumentKeyDown(e) {
        if (referents.length) {
            if (e.keyCode === 27) { // esc
                removeAll();
            } else if (e.altKey && e.keyCode === 37) { // alt + left key
                moveByStep({ x: -1, y: 0 });
            } else if (e.altKey && e.keyCode === 38) { // alt + up key
                moveByStep({ x: 0, y: -1 });
            } else if (e.altKey && e.keyCode === 39) { // alt + right key
                moveByStep({ x: 1, y: 0 });
            } else if (e.altKey && e.keyCode === 40) { // alt + down key
                moveByStep({ x: 0, y: 1 });
            } else if (referents.length === 1) {
                const target = referents[0].target;
                if (e.keyCode === 189) { // -
                    let fontSize = parseInt(getComputedStyle(target).fontSize);
                    fontSize = !e.altKey ? fontSize - 1 : fontSize - 3;
                    if (fontSize < 5) {
                        fontSize = 5;
                    }
                    target.style.fontSize = fontSize + 'px';
                    utils.log("fontSize:", fontSize);
                    history.pushHistory('减小字体');
                } else if (e.keyCode === 187) { // +
                    let fontSize = parseInt(getComputedStyle(target).fontSize);
                    fontSize = !e.altKey ? fontSize + 1 : fontSize + 3;
                    if (fontSize > 100) {
                        fontSize = 100;
                    }
                    target.style.fontSize = fontSize + 'px';
                    utils.log("fontSize:", fontSize);
                    history.pushHistory('增加字体');
                } else if (e.altKey && e.keyCode === 66) { // b
                    let fontWeight = getComputedStyle(target).fontWeight;
                    if (fontWeight === 'bold') {
                        fontWeight = 'normal';
                    } else {
                        fontWeight = 'bold';
                    }
                    target.style.fontWeight = fontWeight;
                    utils.log("fontWeight:", fontWeight);
                    history.pushHistory('切换加粗');
                } else if (e.altKey && e.keyCode === 73) { // i 斜体
                    let fontStyle = getComputedStyle(target).fontStyle;
                    if (fontStyle === 'italic') {
                        fontStyle = 'normal';
                    } else {
                        fontStyle = 'italic';
                    }
                    target.style.fontStyle = fontStyle;
                    utils.log("fontStyle:", fontStyle);
                    history.pushHistory('切换斜体');
                } else if (e.altKey && e.keyCode === 65) { // alt + a 设置动画
                    setFragmentAnimate(target, referents[0]);
                } else if (e.altKey && e.keyCode === 69) { // alt + e 编辑文字/图片
                    editTargetText(target, referents[0]);
                } else if (e.altKey && e.keyCode === 80) { // alt + p 复制属性
                    copyTargetAcctribute(target);
                } else if (e.altKey && e.keyCode === 67) { // alt + c 粘贴属性
                    pasteTargetAcctribute(target);
                } else if (e.altKey && e.keyCode === 46) { // alt + delete 删除元素
                    removeTarget(target);
                }
            } else {
                if (e.altKey && e.keyCode === 85) { // alt + u 切换group状态
                    toggleTargetGroup();
                } else if (e.altKey && e.keyCode === 46) { // alt + delete 删除元素
                    removeTargets(referents);
                }
            }
        } else {
            if (e.keyCode === 27 || e.keyCode === 13) { // esc |  enter
                if (editingTarget) {
                    editingTarget.setAttribute('contenteditable', 'false');
                    createReferents(editingTarget);
                    editingTarget = undefined;
                }
            }
        }
        if (e.altKey && e.keyCode === 83) { // alt + s 保存
            saveMarkdown();
        } else if (e.altKey && e.keyCode === 72) { // alt + h 优化历史记录
            history.optimizeHistory();
        } else if (e.altKey && e.keyCode === 90) { // alt + z 回退
            history.popHistory();
        } else if (e.altKey && e.keyCode === 89) { // alt + y 取消回退
            history.recoverHistory();
        } else if (e.altKey && e.keyCode === 84) { // alt + t 添加文字元素
            createTextTarget();
        } else if (e.altKey && e.keyCode === 77) { // alt + m 添加图片元素
            createImageTarget();
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
        selectTarget,
        getRootHtml: () => root.innerHTML,
        setRootHtml: (html) => { root.innerHTML = html },
        getReferents: () => referents,
    });

    // 全局函数
    window.onReferentMouseDown = onReferentMouseDown;
});
