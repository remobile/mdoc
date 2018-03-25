'use strict';

var anchors = require('./anchors');
var katex = require('./katex');
var emoji = require('markdown-it-emoji');
var footnote = require('markdown-it-footnote');
var tasklists = require('markdown-it-task-lists');

function anchors_plugin(md) {
    md.use(anchors);
}
function katex_plugin(md) {
    md.use(katex);
}
function emoji_plugin(md) {
    md.use(emoji);
}
function footnote_plugin(md) {
    md.use(footnote);
}
function tasklists_plugin(md) {
    md.use(tasklists);
}

module.exports = [
    anchors_plugin,
    katex_plugin,
    emoji_plugin,
    footnote_plugin,
    tasklists_plugin,
];
