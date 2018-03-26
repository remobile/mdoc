'use strict';

var anchors = require('./anchors');
var katex = require('./katex');
var text = require('./text');
var emoji = require('markdown-it-emoji');
var footnote = require('markdown-it-footnote');
var tasklists = require('markdown-it-task-lists');

var HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    ' ': '&nbsp;',
    '\n': '</br>',
};

function escapeHtml(str) {
    if (/[&<>" \n]/.test(str)) {
        return str.replace(/[&<>" \n]/g, (ch) => HTML_REPLACEMENTS[ch]);
    }
    return str;
}

function disable_plugin(md) {
    md.block.ruler.disable('code');
}
function anchors_plugin(md) {
    md.use(anchors);
}
function katex_plugin(md) {
    md.use(katex);
}
function text_plugin(md) {
    md.use(text);
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
function rewrite_plugin(md) {
    md.renderer.rules.text = function (tokens, idx /*, options, env */) {
    console.log('----------', tokens[idx].content);
        var x = escapeHtml(tokens[idx].content);
        console.log('----------]', x);
        return x;
    };
}

module.exports = [
    disable_plugin,
    anchors_plugin,
    // katex_plugin,
    // // text_plugin,
    // emoji_plugin,
    // footnote_plugin,
    // tasklists_plugin,
    rewrite_plugin,
];
