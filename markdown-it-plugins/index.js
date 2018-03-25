'use strict';

var anchors = require('./anchors');
var katex = require('./katex');
var emoji = require('markdown-it-emoji');

function anchors_plugin(md) {
    md.use(anchors);
}
function katex_plugin(md) {
    md.use(katex);
}
function emoji_plugin(md) {
    md.use(emoji);
}

module.exports = [
    anchors_plugin,
    katex_plugin,
    emoji_plugin,
];
