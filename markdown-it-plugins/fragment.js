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
            const content = tokens[idx].markup.split(/\r\n|\n|\r/).join('');
            let style = options.style ? options.style.split(';') : [];
            style.push('position: absolute');
            style.push(`width:${options.w}px`);
            style.push(`height:${options.h}px`);
            style.push(`left:${options.x}px`);
            style.push(`top:${options.y}px`);
            if (options.img) {
                style.push(`background-image:url(${content})`);
                if (options.it == 'r') {
                    style.push(`background-repeat:repeat`);
                    style.push(`background-size:auto`);
                } else  if (options.it == 'hr') {
                    style.push(`background-repeat-x:repeat`);
                    style.push(`background-repeat-y:no-repeat`);
                    style.push(`background-size:auto`);
                } else  if (options.it == 'vr') {
                    style.push(`background-repeat-x:no-repeat`);
                    style.push(`background-repeat-y:repeat`);
                    style.push(`background-size:auto`);
                } else  if (options.it == 'o') {
                    style.push(`background-repeat:no-repeat`);
                    style.push(`background-size:auto`);
                } else  if (options.it == 'cn') {
                    style.push(`background-repeat:no-repeat`);
                    style.push(`background-size:contain`);
                } else  if (options.it == 'cr') {
                    style.push(`background-repeat:no-repeat`);
                    style.push(`background-size:cover`);
                } else {
                    style.push(`background-repeat:no-repeat`);
                    style.push(`background-size:100% 100%`);
                }
                if (options.ic == 'r') {
                    const list = options.ic.split(':');
                    style.push(`background-position-x:${list[0] ? `${list[0]}px` : 'center'}`);
                    style.push(`background-position-y:${list[1] ? `${list[1]}px` : 'center'}`);
                } else {
                    style.push(`background-position:center`);
                }
            } else {
                options.s && style.push(`font-size:${options.s}px`);
                options.b && style.push(`font-weight:bold`);
                options.i && style.push(`font-style:italic`);
                options.c && style.push(`color:${hexToRgba(options.c)}`);
                options.bc && style.push(`background-color:${hexToRgba(options.bc)}`);
            }
            style = style.length ? ` style="${style.join(';')}"` : '';

            let className = options.className ? options.className.split(';') : [];
            page.edit && className.push('target');
            !options.img && className.push('text');
            className = className.length ? ` class="${className.join(' ')}"` : '';

            let dataset = [];
            options.g && dataset.push(`data-group=${options.g}`);
            options.a && dataset.push(`data-animate=${options.a}`);
            options.k && dataset.push(`data-lock=1`);
            options.t && dataset.push(`data-lock=2`);
            dataset = dataset.length ? ` ${dataset.join(' ')}` : '';

            return `<div id="${options.id}"${className}${style}${dataset}>${options.img?'':content}</div>`;
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
