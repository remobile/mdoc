// 'use strict';
// const container = require('./container');
//
// module.exports = function chart_plugin(md) {
//     let chart_id = 0;
//     md.use(container, 'chart', {
//         validate: function(params) {
//             return params.trim().match(/^chart$/);
//         },
//         content: function (tokens, idx) {
//             const content = tokens[idx].markup.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
//             chart_id ++;
//             return `
//             <div id="mdoc_chart_${chart_id}" style="width: 600px;height:400px;"></div>
//             <script>$(document).ready(function(){echarts.init(document.getElementById('mdoc_chart_${chart_id}')).setOption(${content})})</script>
//             `;
//         },
//     });
// };


'use strict';

module.exports = function chart_plugin(md) {
    let chart_id = 0;
    md.renderer.rules.fence_custom.chart = function(tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
        chart_id ++;
        return `
        <div id="mdoc_chart_${chart_id}" style="width: 600px;height:400px;"></div>
        <script>$(document).ready(function(){echarts.init(document.getElementById('mdoc_chart_${chart_id}')).setOption(${content})})</script>
        `;
    };
};
