'use strict';

const { parseParams } = require('../lib/utils');

/*
* 解析简化子集合
从
公司董事会:[总经理:[
    副总经理1:[数据中心,测量中心],
    副总经理2:[技术部,办公室],
    副总经理3:[项目部,评估一部],
    技术总监:[技术部,评估二部],
]]
转化到:
[{
    text: "公司董事会",
    children: [{
        text: "总经理",
        children: [{
            text: "副总经理1",
            children: [{text: "数据中心"},{text: "测量中心"}],
        }, {
            text: "副总经理2",
            children: [{text: "财务部"},{text: "办公室"}],
        }, {
            text: "副总经理3",
            children: [{text: "项目部"},{text: "评估一部"}],
        }, {
            text: "技术总监",
            children: [{text: "技术部"},{text: "评估二部"}],
        }],
    }],
}]
*/
function parseSimpleArray(line) {
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
            item && list.push(item.replace(/\]\s*$/, ']'));
            item='';
        } else {
            item=`${item}${ch}`;
        }
    }
    if (amatch === 0) {
        item && list.push(item.replace(/\]\s*$/, ']'));
    }
    return list.map(o=>parseSimpleObject(o)).filter(o=>o);
}
function parseSimpleObject(line) {
    if (!line) {
        return null;
    }
    let i = -1, max = line.length - 1, item = '';
    while (i++ < max) {
        const ch = line[i];
        if (ch === '[') {
            return {
                text: item,
                children: parseSimpleArray(line.substring(i+1, max)),
            };
        }
        item=`${item}${ch}`;
    }
    return { text: item };
}
module.exports = function mindmap_plugin(md) {
    let mindmap_id = 0;
    md.renderer.rules.fence_custom.mindmap = function(params, tokens, idx) {
        const options = parseParams(params, { width: 600 });
        const content = tokens[idx].content.split('\n').filter(o=>!!o).map(o=>`${o.trim()}`).join('');
        mindmap_id ++;
        let data;
        if (options.json) {
            data = (new Function('','return '+content))();
        } else {
            data = parseSimpleObject(content);
        }

        return `
        <svg id="mdoc_mindmap_${mindmap_id}" class="mindmap_svg"></svg>
        <script>
        $(document).ready(function(){
            var data = ${JSON.stringify(data)};
            var width = ${options.width||800};
            var height = ${options.height||600};
            var duration = ${options.duration||100};
            window.showMindMap('#mdoc_mindmap_${mindmap_id}', data, width, height, duration);
        });
        </script>
        `;
    };
};
