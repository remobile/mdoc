function parseAnimate(animate = '') {
    const list = animate.split(':');
    const name = list[0];
    const rely = list[1]; // 依赖
    const duration = list[2]; // 时长
    const delay = list[3]; // 延时
    const loop = list[4]; // loop
    return { name, rely, duration, delay, loop };
}
function showAnimate(parent, target, animate, force) {
    const name = animate.name;
    const rely = animate.rely;
    const duration = animate.duration;
    const delay = animate.delay;
    const loop = animate.loop;
    if (name) {
        if (force || !rely) {
            target.classList.add('animated', name);
            duration && (target.style.animationDuration = `${duration*1000}ms`);
            !!parent && delay && (target.style.animationDelay = `${delay*1000}ms`);
            !!parent && loop && (target.style.animationIterationCount = loop==-1 ? 'infinite' : loop);
            target.style.visibility = 'visible';
            function handleAnimationEnd() {
                target.classList.remove('animated', name);
                delete target.style.animationDuration;
                delete target.style.animationDelay;
                delete target.style.animationIterationCount;
                target.removeEventListener('animationend', handleAnimationEnd);
                // 如果有依赖该节点的，执行依赖该节点的动画
                const id = target.id;
                parent.children().each(function(){
                    animate = parseAnimate(this.dataset.animate);
                    if (animate.name) {
                        if (animate.rely === id) {
                            showAnimate(parent, this, animate, true);
                        }
                    }
                });
            }
            target.addEventListener('animationend', handleAnimationEnd);
        }
    }
}
function setArrowColor(page, arrows) {
    arrows.css({ backgroundColor: page.dataset.arrowColor||'#FFF' });
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
    // 箭头
    const arrows = $('.arrow-wrap>div');
    $("#container").pageSlider({
        pageSelector:".page",
        loop:false,
        afterMove: function(pages, prePage, curPage, index) {
            // 不显示最后一张的箭头
            if (index + 1 === pages.length) {
                $('.arrow-wrap').addClass('hide');
            } else {
                $('.arrow-wrap').removeClass('hide');
            }
            setArrowColor(curPage[0], arrows);
            let el = $(prePage.children()[0].childNodes[0]);
            el.children().each(function(){
                this.dataset.animate && (this.style.visibility = 'hidden');
            });
            el = $(curPage.children()[0].childNodes[0]);
            el.children().each(function(){
                showAnimate(el, this, parseAnimate(this.dataset.animate));
            });
        },
        onLoaded: function(pages, curPage) {
            setArrowColor(pages[curPage], arrows);
            pages.forEach(function(page, index){
                const el = $(page.childNodes[0].childNodes[0]);
                el.children().each(function(){
                    if (curPage === index) {
                        showAnimate(el, this, parseAnimate(this.dataset.animate));
                    } else {
                        this.dataset.animate && (this.style.visibility = 'hidden');
                    }
                });
            });
        },
    });
}
