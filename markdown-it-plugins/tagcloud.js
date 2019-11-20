'use strict';

const { parseParams, parseArray } = require('../lib/utils');

module.exports = function tagcloud_plugin(md) {
    let tagcloud_id = 0;
    md.renderer.rules.fence_custom.tagcloud = function(params, tokens, idx) {
        const options = parseParams(params, {
            textColour: '#222',
            outlineColour: '#fff',
            maxSpeed: 0.005,
            depth: 0.8,
            updateTime: 30000,
        });

        const initial1 = Math.random() < 1 / 3 ? 1 : Math.random() < 2 / 3 ? 0 : -1;
        const initial2 = !initial1 ? (Math.random() < 1 / 2 ? 1 : -1) : (Math.random() < 1 / 3 ? 1 : Math.random() < 2 / 3 ? 0 : -1);
        const initial = options.initial || [ initial1, initial2 ];
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
                depth: ${options.depth},
                maxSpeed: ${options.maxSpeed},
                initial: ${JSON.stringify(initial)}
            });
            setInterval(function() {
                const initial1 = Math.random() < 1 / 3 ? 1 : Math.random() < 2 / 3 ? 0 : -1;
                const initial2 = !initial1 ? (Math.random() < 1 / 2 ? 1 : -1) : (Math.random() < 1 / 3 ? 1 : Math.random() < 2 / 3 ? 0 : -1);
                TagCanvas.tc['mdoc_tagcloud_${tagcloud_id}'].SetSpeed([ initial1, initial2 ]);
            }, ${options.updateTime});
        })</script>
        `;
    };
};
