'use strict';

var anchors = require('./anchors');
var katex = require('./katex');

function anchors_plugin(md) {
    md.use(anchors);
}

function katex_plugin(md) {
    md.use(katex);
}

module.exports = [
    anchors_plugin,
    katex_plugin,
];
