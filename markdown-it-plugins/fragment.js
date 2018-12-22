'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const container = require('./container');
const { parseParams } = require('../lib/utils');

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
            if (options.w !== undefined)  {
                if (!options.img) {
                    style = `${style}width:${options.w}px;`;
                } else {
                    append = `${append}width="${options.w}px" `;
                }
            }
            if (options.h !== undefined)  {
                if (!options.img) {
                    style = `${style}height:${options.h}px;`;
                } else {
                    append = `${append}height="${options.h}px" `;
                }
            }
            style = `${style}${(options.x < 0) ? `right:${-options.x}px;` : `left:${options.x}px;`}`;
            style = `${style}${(options.y < 0) ? `bottom:${-options.y}px;` : `top:${options.y}px;`}`;
            options.style && (style = `${style}${options.style}`);
            let className = `${options.className} ${page.edit ? 'target' : ''}`;
            if (options.a) {
                className = `${className} fragment ${options.a}`;
            }
            className = className.trim();
            let dataset = '';
            if (options.group) {
                dataset = ` data-group=${options.group}`;
            }

            let html = '';
            if (options.img) {
                html = `<img class="${className}"${dataset} src="${content}" ${append} style="${style}" />`;
            } else {
                html = `
                <div class="text ${className}"${dataset} style="${style}">
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
