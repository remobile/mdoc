let actions = null; // 当前操作的对象
let referents = []; // 当前选中的refrent列表
let history = []; // 历史记录
let depHistory = []; // 回滚的历史记录
let isAltKeyPress = false; // alt是否被按住
let clickX = 0; // 保留上次的X轴位置
let clickY = 0; // 保留上次的Y轴位置©
let group = -1; // 集合的id最小值
let copiedTarget = null; // 复制的target
let colorPicker = null; // 颜色取色器
let animateSelector = null; //动画选择器
let targetTextInput = null; //输入框
let root;

function rgb2hex(color) {
    if (!color || !/^rgb/.test(color)) {
        return color;
    }
    const rgb = color.split(',');
    const r = parseInt(rgb[0].split('(')[1]);
    const g = parseInt(rgb[1]);
    const b = parseInt(rgb[2].split(')')[0]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function getLocation(e) {
    return {
        x: e.x || e.clientX,
        y: e.y || e.clientY,
    }
}
function pushHistory() {
    history.push(root.innerHTML);
    depHistory = [];
}
function popHistory() {
    if (history.length > 1) {
        depHistory.push(history.pop());
        root.innerHTML = history[history.length-1];
    }
}
function recoverHistory() {
    if (depHistory.length) {
        const html = depHistory.pop();
        history.push(html);
        root.innerHTML = html;
    }
}
function initialize() {
    root = document.body;
    history.push(root.innerHTML);
    const list = document.querySelectorAll('.target');
    for (const el of list) {
        group = Math.max(group, +el.dataset.group||0);
    }
}
function copyTarget(target) {
    target.parentNode.insertBefore(target.cloneNode(true), target);
}
function onReferentMouseDown(e, type) {
    const location = getLocation(e);
    clickY = location.y;
    clickX = location.x;
    actions = { operateType: type, node: e.target };
    e.stopPropagation();
    isAltKeyPress && type === 'move' && copyTarget(e.target.target);
}
function onDocumentMouseUp() {
    document.body.style.cursor = "auto";
    if (actions) {
        pushHistory();
        actions = null;
    }
}
function resize(referent, operateType, location) {
    document.body.style.cursor = location + "_resize";
    switch (operateType) {
        case "e": {
            const add_length = clickX - location.x;
            clickX = location.x;
            const length = parseInt(referent.style.width) - add_length;
            referent.style.width = length + "px";
            break;
        }
        case "s": {
            const add_length = clickY - location.y;
            clickY = location.y;
            const length = parseInt(referent.style.height) - add_length;
            referent.style.height = length + "px";
            break;
        }
        case "w": {
            const add_length = clickX - location.x;
            clickX = location.x;
            const length = parseInt(referent.style.width) + add_length;
            referent.style.width = length + "px";
            referent.style.left = clickX + "px";
            break;
        }
        case "n":  {
            const add_length = clickY - location.y;
            clickY = location.y;
            const length = parseInt(referent.style.height) + add_length;
            referent.style.height = length + "px";
            referent.style.top = clickY + "px";
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
function onDocumentMouseMove(e) {
    if (actions) {
        const operateType = actions.operateType;
        const location = getLocation(e);
        let referent;
        if (operateType === 'move') {
            referent = actions.node;
            move(location);
        } else {
            referent = actions.node.parentNode;
            resize(referent, operateType[0], location);
            operateType[1] && resize(referent, operateType[1], location);
            referent.target.style.width = (referent.offsetWidth-2) + "px";
            referent.target.style.height = (referent.offsetHeight-2) + "px";
        }
    }
    return false;
}
// 删除所有的referent
function removeAllReferents() {
    const list = document.querySelectorAll('.referent');
    for (const el of list) {
        document.body.removeChild(el);
    }
    referents = [];
}
// 为target创建一个referent
function createReferentForTarget(target, isGroup) {
    const div = document.createElement("div");
    const dirs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
    const style = `height:${target.offsetHeight}px;width:${target.offsetWidth}px;top:${target.offsetTop-1}px;left:${target.offsetLeft-1}px`;
    const className = 'referent' + (isGroup ? ' group' : '');
    div.innerHTML = `<div class="${className}" style="${style}" onmousedown="onReferentMouseDown(event, 'move')">${dirs.map(dir=>(`<div class="referent_node" data-dir="${dir}" onmousedown="onReferentMouseDown(event, '${dir}')"></div>`)).join('')}</div>`
    const referent = div.childNodes[0];
    referent.target = target;
    document.body.appendChild(referent);
    !referents.push(referent);
    console.log("create referent");
};
function createReferents(target) {
    if (!isAltKeyPress) {
        removeAllReferents();
        removeColorPicker();
        removeAnimateSelector();
        removeTargetTextInput();
    }
    if (!target.dataset.group) {
        createReferentForTarget(target);
    } else {
        const list = document.querySelectorAll(`.target[data-group = "${target.dataset.group}"]`);
        for (const el of list) {
            createReferentForTarget(el, true);
        }
    }
};
function onDocumentMouseDown(e) {
    const classNameList = e.target.className.split(' ');
    if (classNameList.indexOf('target') !== -1) {
        createReferents(e.target);
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
            refrent.className = `${refrent.className} group`;
        }
        console.log("add group");
    } else {
        for (const refrent of referents) {
            delete refrent.target.dataset.group;
            refrent.className = refrent.className.replace('group', '');
        }
        console.log("delete group");
    }
    pushHistory();
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
function saveMarkdown(e) {
    const text = [];
    const list = document.querySelectorAll('.target');
    for (const el of list) {
        const x = el.offsetLeft;
        const y = el.offsetTop;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const isImg = !!el.src;
        const type = isImg ? ' img' : '';
        let style = '';
        if (!isImg) {
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
            const color = rgb2hex(el.style.color);
            if (color && color !== '#000000') {
                style = `${style}color:${color};`;
            }
            const bgcolor = rgb2hex(el.style.backgroundColor);
            if (bgcolor && color !== '#FFFFFF') {
                style = `${style}background-color:${bgcolor};`;
            }
            if (style) {
                style = ` style=${style.replace(/\s/g, '')}`;
            }
        }
        const group = el.dataset.group !== undefined ? ` group=${el.dataset.group}` : '';
        const animate = el.dataset.animate !== undefined ? ` animate=${el.dataset.animate}` : '';

        text.push(`::: fm${type} x=${x} y=${y} w=${w} h=${h}${style}${group}${animate}`);
        (el.src || el.innerText) && text.push(isImg ? el.src : el.innerText);
        text.push(':::');
        text.push('');
    }
    post('/saveMarkdown', text.join('\n'));
}
function copyTargetAcctribute (target) {
    copiedTarget = target;
}
function pasteTargetAcctribute (target) {
    if (copiedTarget) {
        target.style.color = copiedTarget.style.color;
    }
}
function showColorPicker (target, referent) {
    if (colorPicker) {
        removeColorPicker();
        return;
    }
    colorPicker = document.createElement('INPUT');
    colorPicker.jscolor = new jscolor(colorPicker, { closable:true, closeText:'确定' });
    colorPicker.jscolor.fromString(getComputedStyle(target).color);
    colorPicker.onchange = function() {
        target.style.color = `${colorPicker.jscolor.toRGBString()}`;
    };
    colorPicker.jscolor.onClose = function() {
        document.body.removeChild(colorPicker);
        colorPicker = null;
    };
    colorPicker.style.position = 'absolute';
    colorPicker.style.visibility = 'hidden';
    colorPicker.style.left = (referent.offsetLeft +referent.offsetWidth) + "px";
    colorPicker.style.top = (referent.offsetTop - 25) + "px";
    document.body.appendChild(colorPicker);
    colorPicker.jscolor.show();
}
function removeColorPicker () {
    if (colorPicker) {
        colorPicker.jscolor.hide();
        colorPicker = null;
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
    const isImg = !/text/.test(target.className);
    targetTextInput = document.createElement('INPUT');
    targetTextInput.type = 'text';
    targetTextInput.value = !isImg ? target.innerText : target.src.replace(window.location.href, '');
    targetTextInput.className = 'target_input';
    targetTextInput.style.left = (referent.offsetLeft +referent.offsetWidth) + "px";
    targetTextInput.style.top = referent.offsetTop + "px";
    document.body.appendChild(targetTextInput);
    targetTextInput.oninput = function(e) {
        if (!isImg) {
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
    document.body.appendChild(target);
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
    document.body.appendChild(target);
    createReferentForTarget(target);
}
function removeTarget(target) {
    target.remove();
    removeAllReferents();
}
function removeTargets(referents) {
    for (const refrent of referents) {
        refrent.target.remove();
    }
    removeAllReferents();
}
function onDocumentKeyDown(e) {
    if (referents.length) {
        if (e.keyCode === 27) { // esc
            removeAllReferents();
            removeColorPicker();
            removeAnimateSelector();
            removeTargetTextInput();
            pushHistory();
        } else if (referents.length === 1) {
            const target = referents[0].target;
            if (e.keyCode === 189) { // -
                let fontSize = parseInt(getComputedStyle(target).fontSize);
                fontSize = !e.altKey ? fontSize - 1 : fontSize - 3;
                if (fontSize < 5) {
                    fontSize = 5;
                }
                target.style.fontSize = fontSize + 'px';
                pushHistory();
            } else if (e.keyCode === 187) { // +
                let fontSize = parseInt(getComputedStyle(target).fontSize);
                fontSize = !e.altKey ? fontSize + 1 : fontSize + 3;
                if (fontSize > 100) {
                    fontSize = 100;
                }
                target.style.fontSize = fontSize + 'px';
                pushHistory();
            } else if (e.keyCode === 66) { // b
                let fontWeight = parseInt(getComputedStyle(target).fontWeight);
                fontWeight = !e.altKey ? fontWeight + 100 : fontWeight + 300;
                if (fontWeight < 100) {
                    fontWeight = 900;
                }
                if (fontWeight > 900) {
                    fontWeight = 100;
                }
                target.style.fontWeight = fontWeight;
                pushHistory();
            } else if (e.keyCode === 73) { // i 斜体
                let fontStyle = getComputedStyle(target).fontStyle;
                if (fontStyle === 'normal') {
                    fontStyle = 'italic';
                } else if (fontStyle === 'italic') {
                    fontStyle = 'normal';
                }
                target.style.fontStyle = fontStyle;
                pushHistory();
            } else if (e.altKey && e.keyCode === 67) { // alt + c 设置颜色
                showColorPicker(target, referents[0]);
            } else if (e.altKey && e.keyCode === 65) { // alt + a 设置动画
                setFragmentAnimate(target, referents[0]);
            } else if (e.altKey && e.keyCode === 69) { // alt + e 编辑文字
                editTargetText(target, referents[0]);
            } else if (e.altKey && e.keyCode === 80) { // alt + p 复制属性
                copyTargetAcctribute(target);
            } else if (e.altKey && e.keyCode === 86) { // alt + v 粘贴属性
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

    }
    if (e.altKey && e.keyCode === 83) { // alt + s 保存
        saveMarkdown();
    } else if (e.altKey && e.keyCode === 90) { // alt + z 回退
        popHistory();
    } else if (e.altKey && e.keyCode === 89) { // alt + y 取消回退
        recoverHistory();
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
window.onload = function () {
    initialize();
    document.getElementById('info').innerHTML = `
    <ol>
    <li>点击元素进行选中，可以拖动位置，改变大小，按esc取消选择</li>
    <li>按住alt用鼠标拖动一个元素，可以复制该元素</li>
    <li>按住alt，可以选择多个元素，alt+u和合并组和拆开组</li>
    <li>按+号可以增大字体，按住alt按+号可以更快的增加字体</li>
    <li>按-号可以减小字体，按住alt按-号可以更快的减少字体</li>
    <li>alt+a: 设置动画</li>
    <li>alt+t: 添加文字元素</li>
    <li>alt+m: 添加图片元素</li>
    <li>alt+b: 切换字体加粗</li>
    <li>alt+i: 切换字体斜体</li>
    <li>alt+c: 设置字体的颜色</li>
    <li>alt+a: 设置fragment动画</li>
    <li>alt+p: 复制元素属性</li>
    <li>alt+v: 粘贴元素属性</li>
    <li>alt+z: 回滚历史操作</li>
    <li>alt+y: 取消回滚历史</li>
    <li>alt+s: 保存文件至md</li>
    </ol>
    `;
    document.onmousedown = onDocumentMouseDown;
    document.onmousemove = onDocumentMouseMove;
    document.onmouseup = onDocumentMouseUp;
    document.onkeydown = onDocumentKeyDown;
    document.onkeyup = onDocumentKeyUp;
}
