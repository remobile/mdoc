'use strict';
// const container = require('./container');
// module.exports = function sequence_plugin(md) {
//     let sequence_id = 0;
//     md.use(container, 'sequence', {
//         validate: function(params) {
//             return params.trim().match(/^sequence$/);
//         },
//         content: function (tokens, idx) {
//             const content = tokens[idx].markup.split('\n').filter(o=>!!o).map(o=>`'${o.replace(/'/g, `\\'`)}\\n'`).join('+');
//             sequence_id ++;
//             return `
//             <div id="mdoc_sequence_${sequence_id}"></div>
//             <script>$(document).ready(function(){Diagram.parse(${content}).drawSVG("mdoc_sequence_${sequence_id}", {theme: 'simple'})})</script>
//             `;
//         },
//     });
// };

module.exports = function sequence_plugin(md) {
    let sequence_id = 0;
    md.renderer.rules.fence_custom.sequence = function(tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`'${o.replace(/'/g, `\\'`)}\\n'`).join('+');
        sequence_id ++;
        return `
        <div id="mdoc_sequence_${sequence_id}"></div>
        <script>$(document).ready(function(){Diagram.parse(${content}).drawSVG("mdoc_sequence_${sequence_id}", {theme: 'simple'})})</script>
        `;
    };
};
