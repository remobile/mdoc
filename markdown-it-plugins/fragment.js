'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const container = require('./container');
const { parseParams, hexToRgba } = require('../lib/utils');

module.exports = function fragment_plugin(md, page) {
    const MarkdownView = page.MarkdownView;
    let options = {};
    md.use(container, 'fm', {
        validate: function(params) {
            return params.trim().match(/^fm\s*/);
        },
        content: function (tokens, idx) {
            const content = tokens[idx].markup;
            let style = 'position: absolute;';
            let append = '';
            if (options.img) {
                options.w && (append = `${append}width="${options.w}px" `);
                options.h && (append = `${append}height="${options.h}px" `);
            } else {
                options.w && (style = `${style}width:${options.w}px;`);
                options.h && (style = `${style}height:${options.h}px;`);
            }
            style = `${style}left:${options.x}px;`;
            style = `${style}top:${options.y}px;`;

            options.s && (style = `${style}font-size:${options.s}px;`);
            options.b && (style = `${style}font-weight:bold;`);
            options.i && (style = `${style}font-style:italic;`);
            options.c && (style = `${style}color:${hexToRgba(options.c)};`);
            options.bc && (style = `${style}background-color:${hexToRgba(options.bc)};`);

            options.style && (style = `${style}${options.style}`);
            const className = `${options.className||''}${page.edit ? ' target' : ''} ${options.img ? '' : ' text'}`.trim();
            let dataset = '';
            options.g && (dataset = ` data-group=${options.g}`);
            options.a && (dataset = `${dataset} data-animate=${options.a}`);
            options.k && (dataset = `${dataset} data-lock=1`);
            options.t && (dataset = `${dataset} data-lock=2`);

            let html = '';
            if (options.img) {
                html = `<img id="${options.id}" class="${className}" ${dataset} src="${content}" ${append} style="${style}" />`;
            } else {
                html = `
                <div id="${options.id}" class="${className}" ${dataset} style="${style}">
                    ${content}
                </div>
                `;
            }
            return html;
        },
        render: function (tokens, idx) {
            const token = tokens[idx];
            if (token.type === 'container_fm_open') {
                const params = token.info.trim().split(/\s+/).slice(1).join(' ');
                options = parseParams(params, page.edit ? { x:0, y: 0, w:100, h:30 } : { x:0, y: 0 } );
            }
            return '';
        },
    });
};
