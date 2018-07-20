'use strict';

const { parseParams, parseJSON } = require('../lib/utils');

module.exports = function table_plugin(md) {
    let table_id = 0;
    md.renderer.rules.fence_custom.table = function(params, tokens, idx) {
        console.log(params);
        const options = parseParams(params, { width: 800, hasTotalCount: false, pageSize:30 });
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).map(o=>parseJSON(o)).join(',');
        table_id ++;
        console.log("=====", options);
        return `
        <div id="mdoc_table_${table_id}" style="width:${options.width}px;" ></div>
        <script>
        $(document).ready(function(){
                antd.renderTable('mdoc_table_${table_id}', {
                url: '${options.url}',
                listName: '${options.listName}',
                pageSize: ${options.pageSize},
                params: ${JSON.stringify(options.params)},
                hasTotalCount: ${options.hasTotalCount},
                columns: [${content}],
            })
        })
        </script>
        `;
    };
};
