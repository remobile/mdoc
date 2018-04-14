'use strict';

var variable = require('./variable');
var katex = require('./katex');
var flow = require('./flow');
var sequence = require('./sequence');
var chart = require('./chart');
var toc = require('./toc');
var link = require('./link');
var emoji = require('markdown-it-emoji');
var footnote = require('markdown-it-footnote');
var tasklists = require('markdown-it-task-lists');
var attrs = require('markdown-it-attrs');

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
function variable_plugin(md) {
    md.use(variable);
}
function katex_plugin(md) {
    md.use(katex);
}
function flow_plugin(md) {
    md.use(flow);
}
function sequence_plugin(md) {
    md.use(sequence);
}
function chart_plugin(md) {
    md.use(chart);
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
function attrs_plugin(md) {
    md.use(attrs);
}
function toc_plugin(md) {
    md.use(toc);
}
function link_plugin(md) {
    md.use(link);
}
function rewrite_plugin(md) {
    md.renderer.rules.text = function (tokens, idx /*, options, env */) {
        return escapeHtml(tokens[idx].content);;
    };
}

module.exports = [
    disable_plugin,
    variable_plugin,
    katex_plugin,
    flow_plugin,
    sequence_plugin,
    chart_plugin,
    emoji_plugin,
    footnote_plugin,
    tasklists_plugin,
    attrs_plugin,
    toc_plugin,
    link_plugin,
    rewrite_plugin,
];
