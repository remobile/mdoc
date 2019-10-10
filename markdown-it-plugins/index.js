'use strict';

const emoji = require('markdown-it-emoji');
const footnote = require('markdown-it-footnote');
const tasklists = require('markdown-it-task-lists');
const attrs = require('markdown-it-attrs');
const meta = require('./meta');
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
const fragment = require('./fragment');
const tabs = require('./tabs');
const untree = require('./untree');
const react = require('./react');
const artical = require('./artical');
const toc = require('./toc');
const link = require('./link');
const media = require('./media');
const tools = require('./tools');
const list = require('./list');

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
function meta_plugin(md, page) {
    md.use(meta, page);
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
function fragment_plugin(md, page) {
    md.use(fragment, page);
}
function tabs_plugin(md, page) {
    md.use(tabs, page);
}
function untree_plugin(md, page) {
    md.use(untree, page);
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
function tools_plugin(md, page) {
    md.use(tools, page);
}
function list_plugin(md, page) {
    md.use(list, page);
}
function rewrite_plugin(md) {
    md.renderer.rules.text = function (tokens, idx /*, options, env */) {
        return escapeHtml(tokens[idx].content);;
    };
}

module.exports = [
    disable_plugin,
    meta_plugin,
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
    fragment_plugin,
    tabs_plugin,
    untree_plugin,
    react_plugin,
    artical_plugin,
    emoji_plugin,
    footnote_plugin,
    tasklists_plugin,
    attrs_plugin,
    toc_plugin,
    link_plugin,
    media_plugin,
    tools_plugin,
    list_plugin,
    rewrite_plugin,
];
