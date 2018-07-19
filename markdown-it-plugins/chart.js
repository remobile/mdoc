'use strict';

module.exports = function chart_plugin(md) {
    let chart_id = 0;
    md.renderer.rules.fence_custom.chart = function(params, tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
        chart_id ++;
        return `
        <div id="mdoc_chart_${chart_id}" style="width: 600px;height:400px;"></div>
        <script>$(document).ready(function(){echarts.init(document.getElementById('mdoc_chart_${chart_id}')).setOption(${content})})</script>
        `;
    };
};
