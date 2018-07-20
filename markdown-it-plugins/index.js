'use strict';

const emoji = require('markdown-it-emoji');
const footnote = require('markdown-it-footnote');
const tasklists = require('markdown-it-task-lists');
const attrs = require('markdown-it-attrs');
const fence = require('./fence');
const variable = require('./variable');
const katex = require('./katex');
const flow = require('./flow');
const sequence = require('./sequence');
const chart = require('./chart');
const form = require('./form');
const table = require('./table');
const images = require('./images');
const swiper = require('./swiper');
const tabs = require('./tabs');
const react = require('./react');
const artical = require('./artical');
const toc = require('./toc');
const link = require('./link');
const media = require('./media');

const HTML_REPLACEMENTS = {
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
function fence_plugin(md, page) {
    md.use(fence, page);
}
function variable_plugin(md, page) {
    md.use(variable, page);
}
function katex_plugin(md, page) {
    md.use(katex, page);
}
function flow_plugin(md, page) {
    md.use(flow, page);
}
function sequence_plugin(md, page) {
    md.use(sequence, page);
}
function chart_plugin(md, page) {
    md.use(chart, page);
}
function form_plugin(md, page) {
    md.use(form, page);
}
function table_plugin(md, page) {
    md.use(table, page);
}
function images_plugin(md, page) {
    md.use(images, page);
}
function swiper_plugin(md, page) {
    md.use(swiper, page);
}
function tabs_plugin(md, page) {
    md.use(tabs, page);
}
function react_plugin(md, page) {
    md.use(react, page);
}
function artical_plugin(md, page) {
    md.use(artical, page);
}
function emoji_plugin(md, page) {
    md.use(emoji, page);
}
function footnote_plugin(md, page) {
    md.use(footnote, page);
}
function tasklists_plugin(md, page) {
    md.use(tasklists, page);
}
function attrs_plugin(md, page) {
    md.use(attrs, page);
}
function toc_plugin(md, page) {
    md.use(toc, page);
}
function link_plugin(md, page) {
    md.use(link, page);
}
function media_plugin(md, page) {
    md.use(media, page);
}
function rewrite_plugin(md) {
    md.renderer.rules.text = function (tokens, idx /*, options, env */) {
        return escapeHtml(tokens[idx].content);;
    };
}

module.exports = [
    disable_plugin,
    fence_plugin,
    variable_plugin,
    katex_plugin,
    flow_plugin,
    sequence_plugin,
    chart_plugin,
    form_plugin,
    table_plugin,
    images_plugin,
    swiper_plugin,
    tabs_plugin,
    react_plugin,
    artical_plugin,
    emoji_plugin,
    footnote_plugin,
    tasklists_plugin,
    attrs_plugin,
    toc_plugin,
    link_plugin,
    media_plugin,
    rewrite_plugin,
];
