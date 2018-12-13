var action = null; // 当前操作的对象
var target = null; // 要处理的对象
var referent = null; // 参考对象
var clickX = 0; // 保留上次的X轴位置
var clickY = 0; // 保留上次的Y轴位置
var offsetX = 0; // 开始点击时距离被点击的元素的边框 X 距离
var offsetY = 0; // 开始点击时距离被点击的元素的边框 Y 距离
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
var onDragDown = function (e, type) {
    var location = getLocation(e);
    clickY = location.y;
    clickX = location.x;
    offsetX = location.offsetX,
    offsetY = location.offsetY,
    action = this;
    action.operateType = type;
    e.stopPropagation();
};
var onReferentDown = function (e) {
    onDragDown(e, "move");
};
var onUpDown = function (e) {
    onDragDown(e, "n");
};
var onDownDown = function (e) {
    onDragDown(e, "s");
};
var onCenterLeftDown = function (e) {
    onDragDown(e, "w");
};
var onCenterRightDown = function (e) {
    onDragDown(e, "e");
};
var onUpLeftDown = function (e) {
    onDragDown(e, "nw");
};
var onUpRightDown = function (e) {
    onDragDown(e, "ne");
};
var onDownLeftDown = function (e) {
    onDragDown(e, "sw");
};
var onDownRightDown = function (e) {
    onDragDown(e, "se");
};
var onDragUp = function () {
    document.body.style.cursor = "auto";
    action = null;
};
var resize = function (operateType, location) {
    document.body.style.cursor = location + "_resize";
    switch (operateType) {
        case "e": {
            var add_length = clickX - location.x;
            clickX = location.x;
            var length = parseInt(referent.style.width) - add_length;
            referent.style.width = length + "px";
            break;
        }
        case "s": {
            var add_length = clickY - location.y;
            clickY = location.y;
            var length = parseInt(referent.style.height) - add_length;
            referent.style.height = length + "px";
            break;
        }
        case "w": {
            var add_length = clickX - location.x;
            clickX = location.x;
            var length = parseInt(referent.style.width) + add_length;
            referent.style.width = length + "px";
            referent.style.left = clickX + "px";
            break;
        }
        case "n":  {
            var add_length = clickY - location.y;
            clickY = location.y;
            var length = parseInt(referent.style.height) + add_length;
            referent.style.height = length + "px";
            referent.style.top = clickY + "px";
            break;
        }
    }
};
var move = function (location) {
    clickX = location.x;
    clickY = location.y;
    referent.style.left = (clickX - offsetX) + "px";
    referent.style.top = (clickY - offsetY) + "px";
}
var syncTarget = function() {
    if (target) {
        target.style.width = (referent.offsetWidth-2) + "px";
        target.style.height = (referent.offsetHeight-2) + "px";
        target.style.top = (referent.offsetTop+1) + "px";
        target.style.left = (referent.offsetLeft+1) + "px";
    }
};
var onDragMove = function (e) {
    if (action) {
        var location = getLocation(e);
        switch (action.operateType) {
            case "n": {
                resize("n", location);
                break;
            }
            case "s": {
                resize("s", location);
                break;
            }
            case "w": {
                resize("w", location);
                break;
            }
            case "e": {
                resize("e", location);
                break;
            }
            case "nw": {
                resize("n", location);
                resize("w", location);
                break;
            }
            case "ne": {
                resize("n", location);
                resize("e", location);
                break;
            }
            case "sw": {
                resize("s", location);
                resize("w", location);
                break;
            }
            case "se": {
                resize("s", location);
                resize("e", location);
                break;
            }
            case "move": {
                move(location);
                break;
            }
        }
        syncTarget();
    }
    return false;
};
var setTarget = function (ele) {
    target = ele;
    referent.style.height = target.offsetHeight + "px";
    referent.style.width = target.offsetWidth + "px";
    referent.style.top = (target.offsetTop-1) + "px";
    referent.style.left = (target.offsetLeft-1) + "px";
    referent.style.display = "block";
};
var onDocumentDown = function (e) {
    const classNameList = e.target.className.split(' ');
    if (classNameList.indexOf('target') !== -1) {
        setTarget(e.target);
    }
};
var saveMarkdown = function(e) {
    var text = [];
    var list = document.querySelectorAll('.target');
    for (var el of list) {
        var x = el.offsetLeft;
        var y = el.offsetTop;
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        var img = el.src ? ' img' : '';

        text.push('::: fm' + img + 'x='+x+' y='+y+' w='+w+' h='+h);
        text.push(img ? el.src : el.innerHTML);
        text.push(':::');
        text.push('');
        text.push('');
    }
    console.log(text.join('\n'));
};
var onKeyDown = function (e) {
    if (target) {
        if (e.keyCode === 27) { // esc
            referent.style.display = "none";
            target.onmousedown = null;
            target = null;
        } else if (e.keyCode === 189) { // -
            var fontSize = parseInt(getComputedStyle(target).fontSize);
            fontSize = !e.ctrlKey ? fontSize - 1 : fontSize - 3;
            if (fontSize < 5) {
                fontSize = 5;
            }
            target.style.fontSize = fontSize + 'px';
        } else if (e.keyCode === 187) { // +
            var fontSize = parseInt(getComputedStyle(target).fontSize);
            fontSize = !e.ctrlKey ? fontSize + 1 : fontSize + 3;
            if (fontSize > 100) {
                fontSize = 100;
            }
            target.style.fontSize = fontSize + 'px';
        } else if (e.keyCode === 66) { // b
            var fontWeight = parseInt(getComputedStyle(target).fontWeight);
            fontWeight = !e.ctrlKey ? fontWeight + 100 : fontWeight + 300;
            if (fontWeight < 100) {
                fontWeight = 900;
            }
            if (fontWeight > 900) {
                fontWeight = 100;
            }
            target.style.fontWeight = fontWeight;
        } else if (e.keyCode === 73) { // i
            var fontStyle = getComputedStyle(target).fontStyle;
            if (fontStyle === 'normal') {
                fontStyle = 'italic';
            } else if (fontStyle === 'italic') {
                fontStyle = 'normal';
            }
            target.style.fontStyle = fontStyle;
        }
    }
    if (e.keyCode === 83) { // s
        if (e.ctrlKey) {
            saveMarkdown();
        }
    }
};
window.onload = function () {
    referent = $("referent");
    referent.onmousedown = onReferentDown;
    $("referent_center_up").onmousedown = onUpDown;
    $("referent_center_down").onmousedown = onDownDown;
    $("referent_left_middle").onmousedown = onCenterLeftDown;
    $("referent_right_middle").onmousedown = onCenterRightDown;
    $("referent_left_up").onmousedown = onUpLeftDown;
    $("referent_right_up").onmousedown = onUpRightDown;
    $("referent_left_down").onmousedown = onDownLeftDown;
    $("referent_right_down").onmousedown = onDownRightDown;
    document.onmousedown = onDocumentDown;
    document.onmousemove = onDragMove;
    document.onmouseup = onDragUp;
    document.onkeydown = onKeyDown;
}
