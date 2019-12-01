'use strict';

const { parseParams } = require('../lib/utils');

module.exports = function amtitle_plugin(md) {
    md.renderer.rules.fence_custom.amtitle = function(params, tokens, idx) {
        const options = parseParams(params, { li: '', animate: "fade-left" });
        const content = tokens[idx].content;
        return `<div data-aos="${options.animate}" class="amtitle">${content}</div>`;
    };
};
