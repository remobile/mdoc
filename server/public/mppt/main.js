layui.config({
    base: 'mppt/',
    version: true,
    debug: true,
}).use('editor', function(editor) {
    console.log("=======", editor);
    editor.initialize();
    document.getElementById('info').innerHTML = `
    <ol>
    <li>点击元素进行选中，可以拖动位置，改变大小，按esc取消选择</li>
    <li>按住alt用鼠标拖动一个元素，可以复制该元素</li>
    <li>按住alt，可以选择多个元素，alt+u和合并组和拆开组</li>
    <li>按住alt，上下左右键可以移动元素</li>
    <li>按+号可以增大字体，按住alt按+号可以更快的增加字体</li>
    <li>按-号可以减小字体，按住alt按-号可以更快的减少字体</li>
    <li>alt+a: 设置动画</li>
    <li>alt+t: 添加文字元素</li>
    <li>alt+m: 添加图片元素</li>
    <li>alt+b: 切换字体加粗</li>
    <li>alt+i: 切换字体斜体</li>
    <li>alt+r: 设置字体的颜色</li>
    <li>alt+e: 编辑文字/图片</li>
    <li>alt+c: 复制元素属性</li>
    <li>alt+v: 粘贴元素属性</li>
    <li>alt+z: 回滚历史操作</li>
    <li>alt+y: 取消回滚历史</li>
    <li>alt+h: 优化历史记录</li>
    <li>alt+s: 保存文件至md</li>
    </ol>
    `;
    document.onmousedown = editor.onDocumentMouseDown;
    document.onmousemove = editor.onDocumentMouseMove;
    document.onmouseup = editor.onDocumentMouseUp;
    document.onkeydown = editor.onDocumentKeyDown;
    document.onkeyup = editor.onDocumentKeyUp;
});
