'use strict';
const container = require('./container');

module.exports = function flow_plugin(md) {
    md.use(container, 'flow', {
        validate: function(params) {
            return params.trim().match(/^flow$\s+(.*)$/);
        },
        content: function (tokens, idx) {
            return 'fang';
            return `
            <div id="diagram">Diagram will be placed here</div>
            <script>window.flowchart.parse("${tokens[idx].markup}").drawSVG("diagram");</script>
            `;
        },
    });
};
