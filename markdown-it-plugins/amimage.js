'use strict';

const { parseParams } = require('../lib/utils');

module.exports = function amimage_plugin(md, page) {
    md.renderer.rules.fence_custom.amimage = function(params, tokens, idx) {
        const options = parseParams(params, { style: '', animate: "flip-left" });
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`);
        return content.map(o=>{
            return `<img data-aos="${options.animate}" class="amimage" style="${options.style}" src="${o}" />`
        }).join('');
    };
};
