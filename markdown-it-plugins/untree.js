'use strict';

const { parseParams } = require('../lib/utils');

function parseArray(line) {
    const list = [];
    let i = -1, max = line.length - 1, item = '';
    let amatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '[') {
            amatch++;
        } else if (ch === ']') {
            amatch--;
        }
        if (ch === ',' && amatch === 0) {
            item && list.push(/\]\s*$/.test(item) ? item.trim() : item);
            item='';
        } else {
            item=`${item}${ch}`;
        }
    }
    if (amatch === 0) {
        item && list.push(/\]\s*$/.test(item) ? item.trim() : item);
    }
    return list;
}
function parseItem(line) {
    if (!line) {
        return null;
    }
    let i = -1, max = line.length - 1, item = '';
    while (i++ < max) {
        const ch = line[i];
        if (ch === '[') {
            return {
                text: item,
                children: parseArray(line.substring(i+1, max)).map(o=>parseItem(o)).filter(o=>o),
            };
        }
        item=`${item}${ch}`;
    }
    return { text: item };
}
function parse(line) {
    return parseArray(line).map(o=>parseItem(o)).filter(o=>o);
}
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
        const options = parseParams(params, { width: 600 });
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
        untree_id ++;
        let data;
        if (options.json) {
            data = (new Function('','return '+content))();
        } else {
            data = parse(content);
        }
        addId(data, `mdoc_untree_id_${untree_id}`);

        return `
        <div id="mdoc_untree_${untree_id}" style="width:${options.width}px;" >${content}</div>
        <script>
        $(document).ready(function(){
            var tree = new UNTree({
                el: document.getElementById('mdoc_untree_${untree_id}'),
                jsonArr: ${JSON.stringify(data)},
                type: 'tree',

                viewClass: '${options.viewClass||''}',
                itemClass: '${options.itemClass||''}',
                click: ${options.click},
            });
            tree.render();
        })
        </script>
        `;
    };
};
