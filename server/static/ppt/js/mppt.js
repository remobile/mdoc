function parseAnimate(animate = '') {
    const list = animate.split(':');
    const name = list[0];
    const rely = list[1]; // 依赖
    const timeLong = list[2]; // 时长
    const delay = list[3]; // 延时
    const loop = list[4]; // loop
    return { name, rely, timeLong, delay, loop };
}
function showAnimate(parent, target, animate, force) {
    const name = animate.name;
    const rely = animate.rely;
    const timeLong = animate.timeLong;
    const delay = animate.delay;
    const loop = animate.loop;

console.log("=======", animate);
    if (name) {
        if (force || !rely) {
            target.classList.add('animated', name);
            timeLong && (target.style.animationDuration = `${timeLong*1000}ms`);
            !!parent && delay && (target.style.animationDelay = `${delay*1000}ms`);
            !!parent && loop && (target.style.animationIterationCount = loop==-1 ? 'infinite' : loop);
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
            el1 = $(el1.children()[0].childNodes[0]);
            el1.children().each(function(){
                this.dataset.animate && (this.style.visibility = 'hidden');
            });
            el2 = $(el2.children()[0].childNodes[0]);
            el2.children().each(function(){
                showAnimate(el2, this, parseAnimate(this.dataset.animate));
            });
        },
        onLoaded: function(pages, curPage) {
            let el = $(pages[curPage].childNodes[0].childNodes[0]);
            el.children().each(function(){
                showAnimate(el, this, parseAnimate(this.dataset.animate));
            });
        },
    });
}
