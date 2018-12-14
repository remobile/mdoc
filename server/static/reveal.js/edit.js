let action = null; // 当前操作的对象
let target = null; // 要处理的对象
let referent = null; // 参考对象
let clickX = 0; // 保留上次的X轴位置
let clickY = 0; // 保留上次的Y轴位置
let offsetX = 0; // 开始点击时距离被点击的元素的边框 X 距离
let offsetY = 0; // 开始点击时距离被点击的元素的边框 Y 距离
let isAltKeyPress = false; // alt是否被按住

function $(id) {
    return document.getElementById(id);
}
function getLocation(e) {
    return {
        x: e.x || e.clientX,
        y: e.y || e.clientY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
    }
}
function copyTarget(target) {
    target.parentNode.insertBefore(target.cloneNode(true), target);
}
function resize(operateType, location) {
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
    clickX = location.x;
    clickY = location.y;
    referent.style.left = (clickX - offsetX) + "px";
    referent.style.top = (clickY - offsetY) + "px";
}
function onReferentMouseDown(e, type) {
    const location = getLocation(e);
    clickY = location.y;
    clickX = location.x;
    offsetX = location.offsetX,
    offsetY = location.offsetY,
    action = this;
    action.operateType = type;
    e.stopPropagation();
    isAltKeyPress && type === 'move' && copyTarget(e.target);
}
function onDocumentMouseUp() {
    document.body.style.cursor = "auto";
    action = null;
}
function syncTarget(target) {
    target.style.width = (referent.offsetWidth-2) + "px";
    target.style.height = (referent.offsetHeight-2) + "px";
    target.style.top = (referent.offsetTop+1) + "px";
    target.style.left = (referent.offsetLeft+1) + "px";
}
function onDocumentMouseMove(e) {
    if (action) {
        const operateType = action.operateType;
        const location = getLocation(e);
        if (operateType === 'move') {
            move(location);
        } else {
            resize(operateType[0], location);
            operateType[1] && resize(operateType[1], location);
        }
        target && syncTarget(target);
    }
    return false;
}
// 删除所有的referent
function removeAllReferents(html) {
    const list = document.querySelectorAll('.referent');
	for (const el of list) {
        document.removeChild(el);
    }
}
// 为target创建一个referent
function createReferentForTarget(target) {
    const div = document.createElement("div");
    const dirs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
    const style = `height:${target.offsetHeight}px;width:${target.offsetWidth}px;top:${target.offsetTop-1}px;left:${target.offsetLeft-1}px`;
    div.innerHTML = `<div class="referent" style="${style}" onmousedown="onReferentMouseDown(event, 'move')">${dirs.map(dir=>(`<div class="referent_node" data-dir="${dir}" onmousedown="onReferentMouseDown(event, '${dir}')"></div>`)).join('')}</div>`
    const referent = div.childNodes[0];
    referent.target = referent;
    document.body.appendChild(referent);
};
function onDocumentMouseDown(e) {
    const classNameList = e.target.className.split(' ');
    if (classNameList.indexOf('target') !== -1) {
        createReferentForTarget(e.target);
    }
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

        text.push('::: fm' + img + 'x='+x+' y='+y+' w='+w+' h='+h);
        text.push(img ? el.src : el.innerHTML);
        text.push(':::');
        text.push('');
        text.push('');
    }
    console.log(text.join('\n'));
}
function onDocumentKeyDown(e) {
    if (target) {
        if (e.keyCode === 27) { // esc
            referent.style.display = "none";
            target.onmousedown = null;
            target = null;
        } else if (e.keyCode === 189) { // -
            const fontSize = parseInt(getComputedStyle(target).fontSize);
            fontSize = !e.altKey ? fontSize - 1 : fontSize - 3;
            if (fontSize < 5) {
                fontSize = 5;
            }
            target.style.fontSize = fontSize + 'px';
        } else if (e.keyCode === 187) { // +
            const fontSize = parseInt(getComputedStyle(target).fontSize);
            fontSize = !e.altKey ? fontSize + 1 : fontSize + 3;
            if (fontSize > 100) {
                fontSize = 100;
            }
            target.style.fontSize = fontSize + 'px';
        } else if (e.keyCode === 66) { // b
            const fontWeight = parseInt(getComputedStyle(target).fontWeight);
            fontWeight = !e.altKey ? fontWeight + 100 : fontWeight + 300;
            if (fontWeight < 100) {
                fontWeight = 900;
            }
            if (fontWeight > 900) {
                fontWeight = 100;
            }
            target.style.fontWeight = fontWeight;
        } else if (e.keyCode === 73) { // i
            const fontStyle = getComputedStyle(target).fontStyle;
            if (fontStyle === 'normal') {
                fontStyle = 'italic';
            } else if (fontStyle === 'italic') {
                fontStyle = 'normal';
            }
            target.style.fontStyle = fontStyle;
        }
    }
    if (e.keyCode === 83) { // s
        if (e.altKey) {
            saveMarkdown();
        }
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
    document.onmousedown = onDocumentMouseDown;
    document.onmousemove = onDocumentMouseMove;
    document.onmouseup = onDocumentMouseUp;
    document.onkeydown = onDocumentKeyDown;
    document.onkeyup = onDocumentKeyUp;
}
