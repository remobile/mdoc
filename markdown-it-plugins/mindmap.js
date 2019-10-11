'use strict';

const { parseParams, parseSimpleObject } = require('../lib/utils');

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
