
window.onload = function () {
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
