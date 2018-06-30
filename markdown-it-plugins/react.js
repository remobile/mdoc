'use strict';
const React = require('react');
const babel = require("babel-core");
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const { parseParams } = require('../lib/utils');

module.exports = function react_plugin(md, page) {
    const MarkdownView = page.MarkdownView;
    let react_id = 0;
    md.renderer.rules.fence_custom.react = function(params, tokens, idx) {
        const options = parseParams(params);
        const content = tokens[idx].content;
        if (options.dynamic) {
            react_id++;
            const script = babel.transform(content, { plugins:['transform-react-jsx'], presets: ['es2015']}).code;
            return `
            <div id="mdoc_react_${react_id}" />
            <script>
                ${script}
            </script>
            `;
        } else {
            renderToStaticMarkup(content);
        }
    };
};
