const options = {
    ANIMATE_DELAY: 0, //默认的动画延时
    ANIMATE_DURATION: 2, //默认的动画时长
    ANIMATE_TIMES: 1, //默认的动画播放次数
};
function parseAnimate(animate = '') {
    const animates = animate.split(';');
    const list = [];
    for (animate of animates) {
        const items = animate.split(':');
        list.push({
            name: items[0]||undefined,
            duration: items[1]||options.ANIMATE_DURATION,
            delay: items[2]||options.ANIMATE_DELAY,
            times: items[3]||options.ANIMATE_TIMES,
            rely: items[4]||undefined
        });
    }
    return list;
}
function showAnimate(parent, target, animates, index, force) {
    const animate = animates[index];
    const isLast = animates.length - 1 === index;
    const name = animate.name;
    const rely = animate.rely;
    const duration = animate.duration;
    const delay = animate.delay;
    const times = animate.times;

    if (name) {
        if (force || !rely) {
            target.classList.add('animated', name);
            duration && (target.style.animationDuration = `${duration*1000}ms`);
            !!parent && delay && (target.style.animationDelay = `${delay*1000}ms`);
            !!parent && times && (target.style.animationIterationCount = times ? times : 'infinite');
            target.style.visibility = 'visible';
            function handleAnimationEnd() {
                target.classList.remove('animated', name);
                delete target.style.animationDuration;
                delete target.style.animationDelay;
                delete target.style.animationIterationCount;
                target.removeEventListener('animationend', handleAnimationEnd);
                // 如果不是最后一个动画，需要播放下一个动画
                if (!isLast) {
                    showAnimate(parent, target, animates, index+1);
                } else {
                    // 如果是最后一个动画，有依赖该节点的，执行依赖该节点的动画
                    const id = target.id;
                    parent.children().each(function(){
                        animates = parseAnimate(this.dataset.animate);
                        if (animates.length) {
                            if (animates[0].rely === id) {
                                showAnimate(parent, this, animates, 0, true);
                            }
                        }
                    });
                }
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
    const music = document.getElementById('music');
    if (music.paused) {
        $('#music_button').removeClass('rotate');
    };
    $('#music_button').on('touchend', function() {
        if (this.classList.contains('rotate')) {
            music.pause();
            this.classList.remove('rotate');
        } else {
            music.play();
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
                showAnimate(el, this, parseAnimate(this.dataset.animate), 0);
            });
        },
        onLoaded: function(pages, curPage) {
            setArrowColor(pages[curPage], arrows);
            pages.each(function(index, page){
                const el = $(page.childNodes[0].childNodes[0]);
                el.children().each(function(){
                    if (curPage === index) {
                        showAnimate(el, this, parseAnimate(this.dataset.animate), 0);
                    } else {
                        this.dataset.animate && (this.style.visibility = 'hidden');
                    }
                });
            });
        },
    });
}
