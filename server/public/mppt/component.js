layui.use(['jquery'], function() {
        const $ = layui.$;
        const html = $.map($('.target'), target=>{
            const isText = target.classList.contains('text');
            const id = target.getAttribute('id');
            if (isText) {
                return `<div class="component-line" data-target-id="${id}"><i class="layui-icon layui-icon-list"></i><div class="component-text">${target.innerHTML.trim()}<div></div>`;
            } else {
                return `<div class="component-line" data-target-id="${id}"><i class="layui-icon layui-icon-picture-fine"></i><img  class="component-image" src="${target.getAttribute('src')}" /></div>`
            }
        });
        $('#componentContent').html(html);
        $('.component-line').click(function() {
            const id = $(this).data('target-id');
            selectTarget(document.getElementById(id));
        });
 });
