let actions = null; // 当前操作的对象
let referents = []; // 当前选中的refrent列表
let history = []; // 历史记录
let depHistory = []; // 回滚的历史记录
let isAltKeyPress = false; // alt是否被按住
let clickX = 0; // 保留上次的X轴位置
let clickY = 0; // 保留上次的Y轴位置©
let groupId = -1; // 集合的id最小值
let root;

function getLocation(e) {
    return {
        x: e.x || e.clientX,
        y: e.y || e.clientY,
    }
}
function pushHistory() {
    history.push(root.innerHTML);
    console.log(history);
    depHistory = [];
}
function popHistory() {
    if (history.length > 1) {
        depHistory.push(history.pop());
        console.log(history);
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
        groupId = Math.max(groupId, +el.dataset.groupId||0);
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
    isAltKeyPress && type === 'move' && copyTarget(e.target);
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
    }
    if (!target.dataset.groupId) {
        createReferentForTarget(target);
    } else {
        const list = document.querySelectorAll(`.target[data-group-id = "${target.dataset.groupId}"]`);
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
    if (referents[0].target.dataset.groupId === undefined) {
        groupId++;
        for (const refrent of referents) {
            refrent.target.dataset.groupId = groupId;
            refrent.className = `${refrent.className} group`;
        }
        console.log("add group");
    } else {
        for (const refrent of referents) {
            delete refrent.target.dataset.groupId;
            refrent.className = refrent.className.replace('group', '');
        }
        console.log("delete group");
    }
    pushHistory();
}
function saveMarkdown(e) {
    const text = [];
    const list = document.querySelectorAll('.target');
    for (const el of list) {
        const x = el.offsetLeft;
        const y = el.offsetTop;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const img = el.src ? ' img' : '';

        text.push('::: fm' + img + ' x='+x+' y='+y+' w='+w+' h='+h);
        text.push(img ? el.src : el.innerHTML);
        text.push(':::');
        text.push('');
        text.push('');
    }
    console.log(text.join('\n'));
}
function onColorPickerClose (picker) {
    console.log(picker);
}
function showColorPicker (target, referent) {
    const input = document.createElement('INPUT');
    const picker = new jscolor(input)
    picker.fromString('FF6699');
    input.style.position = 'absolute';
    input.style.left = (referent.offsetLeft +referent.offsetWidth) + "px";
    input.style.top = referent.offsetTop + "px";
    document.body.appendChild(input);
    picker.show();
}
function onDocumentKeyDown(e) {
    console.log(e)
    if (referents.length) {
        if (e.keyCode === 27) { // esc
            removeAllReferents();
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
            }
        } else {
            if (e.altKey && e.keyCode === 85) { // alt + u 切换group状态
                toggleTargetGroup();
            }
        }

    }
    if (e.altKey && e.keyCode === 83) { // s
        saveMarkdown();
    } else if (e.altKey && e.keyCode === 90) { // alt + z
        popHistory();
    } else if (e.altKey && e.keyCode === 89) { // alt + y
        recoverHistory();
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
    document.onmousedown = onDocumentMouseDown;
    document.onmousemove = onDocumentMouseMove;
    document.onmouseup = onDocumentMouseUp;
    document.onkeydown = onDocumentKeyDown;
    document.onkeyup = onDocumentKeyUp;
}
