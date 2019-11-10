'use strict';

const { parseParams, parseArray } = require('../lib/utils');

module.exports = function rotateWord_plugin(md) {
    let rotateWord_id = 0;
    md.renderer.rules.fence_custom.rotateWord = function(params, tokens, idx) {
        const options = parseParams(params, {
            backgroundColor: '#222826',
			width: 870,
			height: 350,
			itemWidth:100,
			itemHeight:100,
			itemRadius:50,
			horizontalRadius:270,
			verticalRadius:65,
			scaleRatio:0.4,
			fontSize: 30,
			speed: 0.3,
        });
        const words = tokens[idx].content.split('\n').filter(o=>!!o).join('');
        rotateWord_id ++;
        return `
        <div id="mdoc_rotateWord_${rotateWord_id}" class="${options.className||''}">
        </div>
        <script>$(document).ready(function(){
            showRotateWord('#mdoc_rotateWord_${rotateWord_id}', '${words}', ${JSON.stringify(options)});
        })</script>
        `;
    };
};
