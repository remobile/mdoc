let fullscreen = false;
function fixFullScreen() {
    const W = 375, H = 667;
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
function fixScaleScreen() {
    const W = 375, H = 667;
    const container = document.getElementById('container');
    const bWidth = parseInt(getComputedStyle(document.body).width);
    const bHeight = parseInt(getComputedStyle(document.body).height);
    let scale = 1, left = 0, top = 0, width = bWidth, height = bHeight;

    if (bWidth*667 > 375*bHeight) {
        scale =  bHeight / H;
        width = bHeight * 375 / 667;
        left = (bWidth - width)/2;
    } else {
        scale =  bWidth / W;
        height = bWidth * 667 / 375;
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
        fixScaleScreen();
    }
}
function onDocumentKeyDown(e) {
    if (e.altKey && e.keyCode === 70) { // alt + f
        fullscreen = !fullscreen;
        fixScreen();
    } else if (e.keyCode === 37 || e.keyCode === 38) { // left key
        window.pageSlider.movePrev();
    } else if (e.keyCode === 39 || e.keyCode === 40) { // left key
        window.pageSlider.moveNext();
    }
}
window.onload = function () {
    fixScreen();
    document.body.onresize = fixScreen;
    document.body.style.backgroundColor = '#000';
    document.onkeydown = onDocumentKeyDown;
}
