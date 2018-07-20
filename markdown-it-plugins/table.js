'use strict';

const { parseParams, parseJSON } = require('../lib/utils');

module.exports = function table_plugin(md) {
    let table_id = 0;
    md.renderer.rules.fence_custom.table = function(params, tokens, idx) {
        const options = parseParams(params, { width: 800, hasTotalCount: false, pageSize:30 });
        table_id ++;
        let content;
        if (!options.tabs) {
            const lines = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).map(o=>parseJSON(o)).join(',');
            content = `columns: [${lines}]`;
        } else {
            const lines = tokens[idx].content.split('\n').filter(o=>!!o.trim());
            let header;
            let tables = [];
            let columns = [];
            for (const line of lines) {
                if (/^---/.test(line)) {
                    if (header) {
                        tables.push(`${header[1]}: { label: "${header[2]}", columns: [${columns.join(',')}] }`);
                    }
                    header = line.split(/\s+/g);
                    columns = [];
                } else {
                    columns.push(parseJSON(line));
                }
            }
            header && tables.push(`${header[1]}: { label: "${header[2]}", columns: [${columns.join(',')}] }`);
            content = `tables: {${tables.join(',')}}`;
        }
        return `
        <div id="mdoc_table_${table_id}" style="width:${options.width}px;" ></div>
        <script>
        $(document).ready(function(){
                antd.renderTable('mdoc_table_${table_id}', {
                url: '${options.url}',
                listName: ${options.listName && `'${options.listName}'`},
                pageSize: ${options.pageSize},
                params: ${JSON.stringify(options.params)},
                hasTotalCount: ${options.hasTotalCount},
                ${content},
            })
        })
        </script>
        `;
    };
};
