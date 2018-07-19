'use strict';

const { parseParams, parseJSON } = require('../lib/utils');

module.exports = function form_plugin(md) {
    let form_id = 0;
    md.renderer.rules.fence_custom.form = function(params, tokens, idx) {
        const options = parseParams(params, { width: 600 });
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).map(o=>parseJSON(o)).join(',');
        form_id ++;
        return `
        <div id="mdoc_form_${form_id}" style="width:${options.width}px;" ></div>
        <script>
        $(document).ready(function(){
                antd.renderForm('mdoc_form_${form_id}', {
                url: '${options.url}',
                model: [${content}],
            })
        })
        </script>
        `;
    };
};
