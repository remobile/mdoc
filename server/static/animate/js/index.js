function showAnimate(parent, node, animate, force) {
    if (animate) {
        let animates = animate.split(' ');
        if (force || !animates.find(o => 'after-' === o.substr(0, 6))) {
            node.classList.add('animated', ...animates);
            node.style.visibility = 'visible';
            function handleAnimationEnd() {
                node.classList.remove('animated', ...animates);
                node.removeEventListener('animationend', handleAnimationEnd);
                // 如果有依赖该节点的，执行依赖该节点的动画
                const index = $(node).data('index');
                if (index !== undefined) {
                    let after = 'after-'+index;
                    parent.children().each(function(){
                        let animate = $(this).data('animate');
                        if (animate) {
                            animates = animate.split(' ');
                            if (animates.find(o => o===after)) {
                                showAnimate(parent, this, animate, true);
                            }
                        }
                    });
                }
            }
            node.addEventListener('animationend', handleAnimationEnd);
        }
    }
}
function initPage($){
    // 音乐开关
    const audio = document.getElementById('audio');
    if (audio.paused) {
        $('#audio_button').removeClass('rotate');
    };
    $('#audio_button').on('touchend', function() {
        if (this.classList.contains('rotate')) {
            audio.pause();
            this.classList.remove('rotate');
        } else {
            audio.play();
            this.classList.add('rotate');
        }
    });
    $("#container").pageSlider({
        pageSelector:".page",
        loop:false,
        afterMove: function(pages, el1, el2, index) {
            // 不显示最后一张的箭头
            if (index + 1 === pages.length) {
                $('.arrow-wrap').addClass('hide');
            } else {
                $('.arrow-wrap').removeClass('hide');
            }
            el1.children().each(function(){
                $(this).data('animate') && (this.style.visibility = 'hidden');
            });
            el2.children().each(function(){
                showAnimate(el2, this, $(this).data('animate'));
            });
        },
        onLoaded: function(pages, curPage) {
            let el = $(pages[curPage]);
            el.children().each(function(){
                showAnimate(el, this, $(this).data('animate'));
            });
        },
    });
}
