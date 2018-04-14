'use strict';

var variable = require('./variable');
var katex = require('./katex');
var flow = require('./flow');
var sequence = require('./sequence');
var chart = require('./chart');
var toc = require('./toc');
var link = require('./link');
var media = require('./media');
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
function variable_plugin(md, config) {
    md.use(variable, config);
}
function katex_plugin(md, config) {
    md.use(katex, config);
}
function flow_plugin(md, config) {
    md.use(flow, config);
}
function sequence_plugin(md, config) {
    md.use(sequence, config);
}
function chart_plugin(md, config) {
    md.use(chart, config);
}
function emoji_plugin(md, config) {
    md.use(emoji, config);
}
function footnote_plugin(md, config) {
    md.use(footnote, config);
}
function tasklists_plugin(md, config) {
    md.use(tasklists, config);
}
function attrs_plugin(md, config) {
    md.use(attrs, config);
}
function toc_plugin(md, config) {
    md.use(toc, config);
}
function link_plugin(md, config) {
    md.use(link, config);
}
function media_plugin(md, config) {
    md.use(media, config);
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
    media_plugin,
    rewrite_plugin,
];
