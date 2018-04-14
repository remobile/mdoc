'use strict';
// const container = require('./container');
// module.exports = function flow_plugin(md) {
//     let flow_id = 0;
//     md.use(container, 'flow', {
//         validate: function(params) {
//             return params.trim().match(/^flow$/);
//         },
//         content: function (tokens, idx) {
//             const content = tokens[idx].markup.split('\n').filter(o=>!!o).map(o=>`'${o.replace(/'/g, `\\'`)}\\n'`).join('+');
//             flow_id ++;
//             return `
//             <div id="mdoc_flow_${flow_id}"></div>
//             <script>$(document).ready(function(){flowchart.parse(${content}).drawSVG("mdoc_flow_${flow_id}")})</script>
//             `;
//         },
//     });
// };

module.exports = function flow_plugin(md) {
    let flow_id = 0;
    md.renderer.rules.fence_custom.flow = function(tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`'${o.replace(/'/g, `\\'`)}\\n'`).join('+');
        flow_id ++;
        return `
        <div id="mdoc_flow_${flow_id}"></div>
        <script>$(document).ready(function(){flowchart.parse(${content}).drawSVG("mdoc_flow_${flow_id}")})</script>
        `;
    };
};
