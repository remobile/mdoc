layui.config({
    base: 'mppt/',
    version: true,
    debug: true,
}).use('editor', function(editor) {
    editor.initialize();
    document.onmousedown = editor.onDocumentMouseDown;
    document.onmousemove = editor.onDocumentMouseMove;
    document.onmouseup = editor.onDocumentMouseUp;
    document.onkeydown = editor.onDocumentKeyDown;
    document.onkeyup = editor.onDocumentKeyUp;
});
