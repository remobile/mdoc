'use strict';

const { parseParams, parseArray } = require('../lib/utils');

module.exports = function tagcloud_plugin(md) {
    let tagcloud_id = 0;
    md.renderer.rules.fence_custom.tagcloud = function(params, tokens, idx) {
        const options = parseParams(params, {
            textColour: '#222',
            outlineColour: '#fff',
        });
        const list = options.line ? parseArray(tokens[idx].content.split('\n').filter(o=>!!o).join(' ')): tokens[idx].content.split('\n').filter(o=>!!o);
        tagcloud_id ++;
        return `
        <canvas id="mdoc_tagcloud_${tagcloud_id}" width="${options.width}" height="${options.height}" class="${options.className}">
            ${list.map(o=>`<a href="javascript:void(0);">${o}</a>`).join('')}
        </canvas>
        <script>$(document).ready(function(){
            TagCanvas.Start('mdoc_tagcloud_${tagcloud_id}', 'mdoc_tagcloud_${tagcloud_id}', {
        		textColour: '${options.textColour}',
        		outlineColour: '${options.outlineColour}',
        		reverse: true,
        		hideTags: false,
        		noMouse: true,
        		weight: true,
        		wheelZoom: false,
        		depth: 0.8,
        		decel:0.95,
        		maxSpeed: 0.05,
        		initial: [-0.2, 0]
        	});
        })</script>
        `;
    };
};
