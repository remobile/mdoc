'use strict';

var anchors = require('./anchors');
var katex = require('./katex');
var flow = require('./flow');
var emoji = require('markdown-it-emoji');
var footnote = require('markdown-it-footnote');
var tasklists = require('markdown-it-task-lists');

var HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    ' ': '&ensp;',
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
function flow_plugin(md) {
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
function rewrite_plugin(md) {
    md.renderer.rules.text = function (tokens, idx /*, options, env */) {
        return escapeHtml(tokens[idx].content);;
    };
}

module.exports = [
    disable_plugin,
    anchors_plugin,
    katex_plugin,
    flow_plugin,
    emoji_plugin,
    footnote_plugin,
    tasklists_plugin,
    rewrite_plugin,
];
