'use strict';

const { parseParams } = require('../lib/utils');

module.exports = function clockRotate_plugin(md) {
    let clockRotate_id = 0;
    md.renderer.rules.fence_custom.clockRotate = function(params, tokens, idx) {
        const options = parseParams(params, {
            radius: 300,
            fontSize: 20,
        });
        const words = tokens[idx].content.split('\n').filter(o=>!!o).join('');
        clockRotate_id ++;
        const className = options.className ? `${options.className} clockRotate` : 'clockRotate';
        return `
        <div id="mdoc_clockRotate_${clockRotate_id}" class="${className}">
        </div>
        <script>$(document).ready(function(){
            showClockRotate('#mdoc_clockRotate_${clockRotate_id}', '${words}', ${JSON.stringify(options)});
        })</script>
        `;
    };
};
