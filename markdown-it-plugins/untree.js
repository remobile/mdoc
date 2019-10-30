'use strict';

const { parseParams, parseSimpleArray } = require('../lib/utils');

function addId(data, parentId) {
    if (data instanceof Array) {
        for (const k in data) {
            const item = data[k];
            const id = `${parentId}_${k}`;
            item.id = id;
            addId(item.children, id);
        }
    }
}

module.exports = function untree_plugin(md) {
    let untree_id = 0;
    md.renderer.rules.fence_custom.untree = function(params, tokens, idx) {
        const options = parseParams(params);
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
        untree_id ++;
        let data;
        if (options.json) {
            data = (new Function('','return '+content))();
        } else {
            data = parseSimpleArray(content);
        }
        addId(data, `mdoc_untree_id_${untree_id}`);
        let style = '', itemClass = '', text = '';
        if (options.width) {
            style= `style="width:${options.width}px;"`;
        }
        if (options.itemClass) {
            if (/^__function_start__.*__function_end__$/.test(options.itemClass)) {
                text = `text: ${options.itemClass.replace(/__function_start__|____function_end__/g, '')},`;
            } else {
                itemClass = `itemClass: '${options.itemClass}',`;
            }
        }
        if (options.text) {
            if (/^__function_start__.*__function_end__$/.test(options.text)) {
                text = `text: ${options.text.replace(/__function_start__|____function_end__/g, '')},`;
            } else {
                text = `text: '${options.text}',`;
            }
        }

        return `
        <div id="mdoc_untree_${untree_id}" ${style}"></div>
        <script>
        $(document).ready(function(){
            var tree = new window.UNTree({
                el: document.getElementById('mdoc_untree_${untree_id}'),
                jsonArr: ${JSON.stringify(data)},
                type: 'tree',
                viewClass: '${options.viewClass||''}',${itemClass}${text}
                click: ${options.click},
            });
            tree.render();
        })
        </script>
        `;
    };
};
