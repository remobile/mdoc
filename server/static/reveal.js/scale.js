let fullscreen = false;
function fixFullScreen() {
    const W = 1066.67, H = 600;
    const container = document.getElementById('container');
    const bWidth = parseInt(getComputedStyle(document.body).width);
    const bHeight = parseInt(getComputedStyle(document.body).height);
    const scaleX = bWidth / W;
    const scaleY = bHeight / H;
    container.style.width = `${bWidth}px`;
    container.style.height = `${bHeight}px`;
    container.style.top = `0px`;
    container.style.left = `0px`;
    const list = document.querySelectorAll('.ppt-frame');
    for (const el of list) {
        el.style.transformOrigin = `top left`;
        el.style.transform = `scale(${scaleX}, ${scaleY}) translate(-1px, -1px)`;
    }
}
function fix16_9Screen() {
    const W = 1066.67, H = 600;
    const container = document.getElementById('container');
    const bWidth = parseInt(getComputedStyle(document.body).width);
    const bHeight = parseInt(getComputedStyle(document.body).height);
    let scale = 1, left = 0, top = 0, width = bWidth, height = bHeight;
    if (bWidth*9 > 16*bHeight) {
        scale =  bHeight / H;
        width = bHeight * 16 / 9;
        left = (bWidth - width)/2;
    } else {
        scale =  bWidth / W;
        height = bWidth * 9 / 16;
        top = (bHeight - height)/2;
    }
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.top = `${top}px`;
    container.style.left = `${left}px`;

    const list = document.querySelectorAll('.ppt-frame');
    for (const el of list) {
        el.style.transformOrigin = `top left`;
        el.style.transform = `scale(${scale}) translate(-1px, -1px)`;
    }
}
function fixScreen() {
    if (fullscreen) {
        fixFullScreen();
    } else {
        fix16_9Screen();
    }
}
function onDocumentKeyDown(e) {
    if (e.altKey && e.keyCode === 70) { // alt + f
        fullscreen = !fullscreen;
        fixScreen();
    }
}
window.onload = function () {
    fixScreen();
    document.body.onresize = fixScreen;
    document.onkeydown = onDocumentKeyDown;
}
