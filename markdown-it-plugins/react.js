'use strict';
const React = require('react');
const babel = require("babel-core");
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const { parseParams } = require('../lib/utils');

module.exports = function react_plugin(md, page) {
    const MarkdownView = page.MarkdownView;
    let react_id = 0;
    md.renderer.rules.fence_custom.react = function(params, tokens, idx) {
        const options = parseParams(params, { static: true });
        const content = tokens[idx].content;
        const script = babel.transform(content, { plugins:['transform-react-jsx'], presets: ['es2015']}).code;
        if (!options.static) {
            react_id++;
            return `
            <div id="mdoc_react_${react_id}" />
            <script>
                ${script.replace('module.exports', 'var __mdoc_react_export'+react_id)}
                ReactDOM.render(__mdoc_react_export${react_id}, document.getElementById("mdoc_react_${react_id}"));
            </script>
            `;
        } else {
            return renderToStaticMarkup(eval(script));
        }
    };
};
