layui.config({
    base: 'mppt/',
    version: true,
    debug: true,
}).use('editor', function(editor) {
    layui.link('mppt/font/iconfont.css');
    editor.initialize();
    document.onmousedown = editor.onDocumentMouseDown;
    document.onmousemove = editor.onDocumentMouseMove;
    document.onmouseup = editor.onDocumentMouseUp;
    document.onkeydown = editor.onDocumentKeyDown;
    document.onkeyup = editor.onDocumentKeyUp;
});
