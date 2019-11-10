function addStyle(style, i, c1, c2) {
    style.appendChild(document.createTextNode('.rotate-word-color'+i+' { color:'+c2+';animation: rotate-word-light'+i+' 1.5s ease infinite alternate;}'));
    style.appendChild(document.createTextNode('@keyframes rotate-word-light'+i+' { from { text-shadow: 0 0 10px '+c1+', 0 0 20px '+c1+', 0 0 30px '+c1+', 0 0 40px '+c2+', 0 0 70px '+c2+', 0 0 80px '+c2+', 0 0 100px '+c2+', 0 0 150px '+c2+'; } to { text-shadow: 0 0 10px '+c1+', 0 0 20px '+c1+', 0 0 30px '+c1+', 0 0 40px '+c2+', 0 0 70px '+c2+', 0 0 80px '+c2+', 0 0 100px '+c2+', 0 0 150px '+c2+'; }}'));
}
function showRotateWord(id, letters, options) {
    var children = [];
    var degree = 0;
    var count = letters.length;
    var container = $(id);

    // 添加发光
    var style = document.createElement('style');
    var colors = ['#B22222', '#00a67c', '#FF0000', '#458B00', '#FF8C00'];
    for (var i=0; i<5; i++) {
        addStyle(style, i, '#fff', colors[i]);
    }
    document.getElementsByTagName("head")[0].appendChild(style);

    // 生成字体
    container.addClass("rotate-word").css({
        width: options.width,
        height: options.height
    });
    for (var i = 0; i < count; i++) {
        var child = $('<div class="rotate-word-item">'+letters[i]+'</div>').appendTo(container);
        var x = Math.floor(Math.random()*5);
        child.addClass("rotate-word-color"+x).css({
            width: options.itemWidth,
            height: options.itemHeight,
            marginTop: options.marginTop,
            marginLeft: options.marginLeft,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: options.backgroundColor ? '"' + options.backgroundColor + '"' : undefined,
            position:'absolute',
            borderRadius: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: options.backgroundImage ? 'url('+options.backgroundImage+')' : undefined,
            fontSize: options.fontSize + 'px',
        });
        children.push(child);
    }
    // 设置旋转动画
    function draw() {
        degree = degree >= 360 ? 0 : degree + options.speed;
        children.forEach(function(child, index){
            var el = $(child);
            var angle = (90 + degree - 360 / count * index) * Math.PI / 180;
            var offset = Math.sin(angle) * options.verticalRadius + options.height / 2 - options.itemHeight / 2;
            var rate = (offset - (options.height / 2 - options.verticalRadius - options.itemHeight / 2)) / (options.verticalRadius * 2) * (1 - options.scaleRatio) + options.scaleRatio;
            el.css({
                width: options.itemWidth * rate,
                height: options.itemHeight * rate,
                left: Math.cos(angle) * options.horizontalRadius + options.width / 2 - options.itemWidth / 2 + options.itemWidth * (1 - rate) / 2,
                top: offset + options.itemHeight * (1 - rate) / 2,
                zIndex: Math.floor(rate * 10 * count)
            });
        });
    }

    function loop() {
        draw();
        requestAnimationFrame(loop);
    }
    loop();
}
