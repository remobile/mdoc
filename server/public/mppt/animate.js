layui.define(['jquery', 'form', 'history'], function(exports) {
    const $ = layui.$;
    const form = layui.form;
    const slider = layui.slider;
    const history = layui.history;
    const animate_list = [
        { value: 'none', name: '无' },
        { value: 'zoomIn', name: '中心放大' },
        { value: 'fadeIn', name: '淡入' },
        { value: 'slideInDown', name: '从上滑入' },
        { value: 'slideInUp', name: '从下滑入' },
        { value: 'slideInLeft', name: '从左滑入' },
        { value: 'slideInRight', name: '从右滑入' },
    ];

    let editor;
    let control;
    let component;
    function initialize() {
        editor = layui.editor;
        control = layui.control;
        component = layui.component;
        $('#addAnimateButton').click(addAnimate);
    }
    function createAnimatePanel(index) {
        return `
        <div class="line"></div>
        <form id="animatePanel${index}" class="layui-form layui-form-pane">
            <div class="layui-form-item">
                <label class="layui-form-label">动画</label>
                <div class="layui-input-block">
                    <select id="animateList${index}" lay-filter="animateList${index}">
                        ${animate_list.map(o=>`<option value="${o.value}">${o.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="layui-form-item no-animate">
                <label class="layui-form-label">循环</label>
                <div class="layui-input-block">
                    <div id="animateLoopSlider${index}" class="slider-container"></div>
                </div>
            </div>
            <div class="layui-form-item no-animate">
                <label class="layui-form-label">时长</label>
                <div class="layui-input-block">
                    <div id="animateDurationSlider${index}" class="slider-container"></div>
                </div>
            </div>
            <div class="layui-form-item no-animate">
                <label class="layui-form-label">延时</label>
                <div class="layui-input-block">
                    <div id="animateDelaySlider${index}" class="slider-container"></div>
                </div>
            </div>
        </form>
        `;
    }
    // 更新属性的值
    function updateValues(target, animates) {
        $('#animateList0').html(animate_list.map(o=>`<option value="${o.value}">${o.name}</option>`).join(''));
        $('#animateList0').attr('lay-filter', 'animateList0');
        form.on(`select(animateList0)`, function(data){
            if (data.value === 'none') {
                $('.no-animate').hide();
                $('.no-animate-ext').hide();
                setAnimate();
            } else {
                $('.no-animate').show();
                $('.no-animate-ext').show();
                setAnimate({ name: data.value });
                updateValues(target);
            }
        });
        let animate = target.dataset.animate;
        if (animate) {
            let html = '';
            animates = animates || parseAnimate(animate);
            for (let i in animates) {
                if (i > 0) {
                    animate = animates[i];
                    html += createAnimatePanel(i);
                }
            }
            $('#animateFollows').html(html);
            $('.no-animate').show();
            _.last(animates).name && $('.no-animate-ext').show();
            // 设置依赖
            $('#animateRely').html(component.getRelyItem(animates[0].rely));

            for (let i in animates) {
                animate = animates[i];
                $(`#animateList${i}`).val(animate.name);
                form.on(`select(animateList${i})`, function(data){
                    if (data.value === 'none') {
                        $('.no-animate-ext').show();
                        setAnimate(null, i);
                        updateValues(target);
                    } else {
                        $('.no-animate-ext').show();
                        setAnimate({ name: data.value }, i);
                    }
                });
                slider.render({
                    elem: `#animateLoopSlider${i}`,
                    value: animate.loop,
                    min: -1,
                    max: 10,
                    change: function(loop){
                        setAnimate({ loop }, i);
                    },
                });
                slider.render({
                    elem: `#animateDurationSlider${i}`,
                    value: animate.duration,
                    min: 0,
                    max: 10,
                    change: function(duration){
                        setAnimate({ duration }, i);
                    },
                });
                slider.render({
                    elem: `#animateDelaySlider${i}`,
                    value: animate.delay,
                    min: 0,
                    max: 10,
                    change: function(delay){
                        setAnimate({ delay }, i)
                    },
                });
            }
        } else {
            $('.no-animate').hide();
        }
        form.render('select');
    }
    // 动画规则，只能连续动画，不能重叠动画
    // 设置动画(格式:zoomIn:a:b:c:d 其中a:时长,b:延时,c:loop,d:依赖id) 多个动画用;隔开，只有首歌动态才能设置依赖
    function parseAnimate(animate = '') {
        const animates = animate.split(';');
        const list = [];
        for (animate of animates) {
            const items = animate.split(':');
            list.push({ name: items[0], duration: items[1], delay: items[2], loop: items[3], rely: items[4] });
        }
        return list;
    }
    function fromatAnimate(animates) {
        const list = [];
        for (animate of animates) {
            if (animate.name) {
                list.push(`${animate.name||''}:${animate.duration||''}:${animate.delay||''}:${animate.loop||''}:${animate.rely||''}`.replace(/:*$/, ''));
            }
        }
        return list.join(';');
    }
    function setAnimate(options, index = 0) {
        const curAnimate = editor.getAction().target.dataset.animate;
        const referents = editor.getReferents();
        for (const referent of referents) {
            const target = referent.target;
            let animate = target.dataset.animate;
            if (curAnimate !== animate) {
                continue;
            }
            let animates = parseAnimate(animate);
            if (options) {
                const _animate = animates[index] || {};
                animate = { ..._animate, ...options };
                showItemAnimate(target, animate);
                options.rely != _animate.rely && $('#animateRely').html(component.getRelyItem(options.rely));
                animates[index] = animate;
                target.dataset.animate = fromatAnimate(animates);
            } else {
                animates.splice(index, 1);
                target.dataset.animate = fromatAnimate(animates);
            }
        }
        history.pushHistory('设置动画');
    }
    function addAnimate() {
        const target = editor.getAction().target;
        if (target) {
            let animate = target.dataset.animate;
            let animates = parseAnimate(animate).filter(o=>o.name);
            animates.push({});
            updateValues(target, animates);
            $('.no-animate-ext').hide();
        }
    }
    function showItemAnimate(target, animate) {
        const name = animate.name;
        target.classList.add('animated', name);
        function handleAnimationEnd() {
            target.classList.remove('animated', name);
            target.removeEventListener('animationend', handleAnimationEnd);
        }
        target.addEventListener('animationend', handleAnimationEnd);
    }
    function showAnimate(parent, target, animates, index, force) {
        const animate = animates[index];
        const isLast = animates.length - 1 === index;
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
    function playCurrentPage() {
        editor.removeAll();
        const root = $('#editor>span');
        root.children().each(function(){
            const animates = parseAnimate(this.dataset.animate);
            console.log("=======", animates);
            showAnimate(root, this, animates, 0);
        });
    }

    exports('animate', {
        initialize,
        updateValues,
        setAnimate,
        playCurrentPage,
    });
});
