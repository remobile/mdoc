'use strict';

const { parseParams, parseArray } = require('../lib/utils');

module.exports = function tagcloud_plugin(md) {
    let tagcloud_id = 0;
    md.renderer.rules.fence_custom.tagcloud = function(params, tokens, idx) {
        const options = parseParams(params, {
            width: 600,
            height: 600,
            className: '',
            textFont : 'Trebuchet MS, Helvetica',
            textColour : '#333',
            textHeight : 18,
            outlineColour : '#E2E1C1',
            maxSpeed : 0.03,
            outlineMethod : 'block',
            minBrightness : 0.2,
            depth : 0.92,
            pulsateTo : 0.6,
            initial : [0.1,-0.1],
            decel : 0.98,
            reverse : true,
            hideTags : false,
            shadow : '#ccf',
            shadowBlur : 3,
            weight : false,
            imageScale : null,
            fadeIn : 1000,
            clickToFront : 600,
        });
        const list = options.line ? parseArray(tokens[idx].content.split('\n').filter(o=>!!o).join(' ')): tokens[idx].content.split('\n').filter(o=>!!o);
        tagcloud_id ++;
        return `
        <canvas id="mdoc_tagcloud_${tagcloud_id}" width="${options.width}" height="${options.height}" class="${options.className}">
            ${list.map(o=>`<a href="javascript:void(0);">${o}</a>`).join('')}
        </canvas>
        <script>$(document).ready(function(){
            TagCanvas.Start('mdoc_tagcloud_${tagcloud_id}', 'mdoc_tagcloud_${tagcloud_id}', {
        		textColour: '#222',
        		outlineColour: '#fff',
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
