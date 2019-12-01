'use strict';

const { parseParams } = require('../lib/utils');

module.exports = function amtext_plugin(md) {
    md.renderer.rules.fence_custom.amtext = function(params, tokens, idx) {
        const options = parseParams(params, { animate: "fade-left" });
        const content = tokens[idx].content.split('\n').filter(o=>!!o);
        return content.map(o=>`<div data-aos="${options.animate}" class="amtext">${(options.li ?  options.li + ' ' : '&#8195;&#8195;') +o}</div>`).join('');
    };
};
