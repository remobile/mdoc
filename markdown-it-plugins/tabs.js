'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const container = require('./container');
const { parseParams } = require('../lib/utils');

module.exports = function tabs_plugin(md, page) {
    const MarkdownView = page.MarkdownView;
    let tabs_id = 0;
    let options = { width: 300, height: 300 };
    md.use(container, 'tabs', {
        validate: function(params) {
            return params.trim().match(/^tabs\s+(.*)$/);
        },
        content: function (tokens, idx) {
            const lines = tokens[idx].markup.split('\n');
            let head = '';
            let body = '';
            let item = '';
            let begin = false;
            for (const line of lines) {
                if (/^---\s+[^\s]+$/.test(line)) {
                    head = `${head}<li>${line.replace(/^---\s+([^\s]+)$/, '$1')}</li>`;
                    if (!begin) {
                        begin = true;
                    } else {
                        body = `${body}<div>${renderToStaticMarkup(<MarkdownView source={item} page={page} />)}</div>`;
                        item = '';
                    }
                } else if (begin) {
                    item = item ? `${item}\n${line}` : line;
                }
            }
            head = `<ul>${head}</ul>`;
            body = `${body}<div>${renderToStaticMarkup(<MarkdownView source={item} page={page} />)}</div>`;
            tabs_id ++;
            return `
            <div id="mdoc_tabs_${tabs_id}" style="width:${options.width}px;height:${options.height}px;">
                ${head}
                ${body}
            </div>
            <script>
            $(document).ready(function(){
                tabify( '#mdoc_tabs_${tabs_id}' );
            })
            </script>
            `;
        },
        render: function (tokens, idx) {
            const token = tokens[idx];
            if (token.type === 'container_tabs_open') {
                const params = token.info.trim().split(/\s+/);
                options = parseParams(params, { width: 300, height: 300 });
            }
            return '';
        },
    });
};
