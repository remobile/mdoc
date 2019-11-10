function addStyle(style, i, c1, c2) {
    style.appendChild(document.createTextNode('.clock-rotate-color'+i+' { color:'+c2+';animation: clock-rotate-light'+i+' 1.5s ease infinite alternate;}'));
    style.appendChild(document.createTextNode('@keyframes clock-rotate-light'+i+' { from { text-shadow: 0 0 10px '+c1+', 0 0 20px '+c1+', 0 0 30px '+c1+', 0 0 40px '+c2+', 0 0 70px '+c2+', 0 0 80px '+c2+', 0 0 100px '+c2+', 0 0 150px '+c2+'; } to { text-shadow: 0 0 10px '+c1+', 0 0 20px '+c1+', 0 0 30px '+c1+', 0 0 40px '+c2+', 0 0 70px '+c2+', 0 0 80px '+c2+', 0 0 100px '+c2+', 0 0 150px '+c2+'; }}'));
}

function showClockRotate(el, text, options) {
    // 添加发光
    var style = document.createElement('style');
    var colors = ['#B22222', '#00a67c', '#FF0000', '#458B00', '#FF8C00'];
    for (var i=0; i<5; i++) {
        addStyle(style, i, '#fff', colors[i]);
    }
    document.getElementsByTagName("head")[0].appendChild(style);

    var element = document.querySelector(el);
    element.style.width = options.radius*2;
    element.style.height = options.radius*2;
    element.style.fontSize = options.fontSize;
    for (var i = 0; i < text.length; i++) {
        var letter = text[i];
        var span = document.createElement('span');
        var node = document.createTextNode(letter);
        var r = (360/text.length)*(i);
        var x = (Math.PI/text.length).toFixed(0) * (i);
        var y = (Math.PI/text.length).toFixed(0) * (i);
        span.appendChild(node);
        span.style.webkitTransform = 'rotateZ('+r+'deg) translate3d('+x+'px,'+y+'px,0)';
        span.style.transform = 'rotateZ('+r+'deg) translate3d('+x+'px,'+y+'px,0)';
        span.className = "clock-rotate-color"+Math.floor(Math.random()*5);
        element.appendChild(span);
    }
}
