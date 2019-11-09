'use strict';

const { parseParams, parseArray } = require('../lib/utils');

module.exports = function tagcloud_plugin(md) {
    let tagcloud_id = 0;
    md.renderer.rules.fence_custom.tagcloud = function(params, tokens, idx) {
        const options = parseParams(params, {
            width: 600,
            height: 600,
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
        <canvas id="mdoc_tagcloud_${tagcloud_id}" width="${options.width}" height="${options.height}">
            ${list.map(o=>`<a href="javascript:void(0);">${o}</a>`).join('')}
        </canvas>
        <script>$(document).ready(function(){
            TagCanvas.textFont = "${options.textFont}";
            TagCanvas.textColour = "${options.textColour}";
            TagCanvas.textHeight = ${options.textHeight};
            TagCanvas.outlineColour = "${options.outlineColour}";
            TagCanvas.maxSpeed = ${options.maxSpeed};
            TagCanvas.outlineMethod = "${options.outlineMethod}";
            TagCanvas.minBrightness = ${options.minBrightness};
            TagCanvas.depth = ${options.depth};
            TagCanvas.pulsateTo = ${options.pulsateTo};
            TagCanvas.initial = ${options.initial};
            TagCanvas.decel = ${options.decel};
            TagCanvas.reverse = ${options.reverse};
            TagCanvas.hideTags = ${options.hideTags};
            TagCanvas.shadow = "${options.shadow}";
            TagCanvas.shadowBlur = ${options.shadowBlur};
            TagCanvas.weight = ${options.weight};
            TagCanvas.imageScale = ${options.imageScale};
            TagCanvas.fadeIn = ${options.fadeIn};
            TagCanvas.clickToFront = ${options.clickToFront};
            TagCanvas.Start("mdoc_tagcloud_${tagcloud_id}");
            TagCanvas.tc["mdoc_tagcloud_${tagcloud_id}"].Wheel(false);
        })</script>
        `;
    };
};
