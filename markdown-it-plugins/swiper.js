'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const container = require('./container');
const { parseParams } = require('../lib/utils');

module.exports = function swiper_plugin(md, page) {
    const MarkdownView = page.MarkdownView;
    let swiper_id = 0;
    let options = { width: 300, height: 300 };
    md.use(container, 'swiper', {
        validate: function(params) {
            return params.trim().match(/^swiper\s+(.*)$/);
        },
        content: function (tokens, idx) {
            const content = tokens[idx].markup.split('\n---\n').filter(o=>!!o.trim());
            swiper_id ++;
            return `
            <div class="swiper-container" id="mdoc_swiper_${swiper_id}" style="width:${options.width}px;height:${options.height}px;">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                    ${content.map(o=>renderToStaticMarkup(<MarkdownView source={o} page={page} />)).join(`</div><div class="swiper-slide">`)}
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
            <script>
            $(document).ready(function(){
                var swiper = new Swiper('#mdoc_swiper_${swiper_id}', {
                    pagination: {
                        el: '.swiper-pagination',
                    },
                })
            })
            </script>
            `;
        },
        render: function (tokens, idx) {
            const token = tokens[idx];
            if (token.type === 'container_swiper_open') {
                const params = token.info.trim().split(/\s+/).slice(1).join(' ');
                options = parseParams(params, { width: 300, height: 300 });
            }
            return '';
        },
    });
};
