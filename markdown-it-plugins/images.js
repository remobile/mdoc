'use strict';

const { support, parseParams } = require('../lib/utils');

module.exports = function images_plugin(md, page) {
    let images_id = 0;
    md.renderer.rules.fence_custom.images = function(params, tokens, idx) {
        const options = parseParams(params, { width: 600, col: 3 });
        const content = tokens[idx].content.split('\n').filter(o=>!!o);
        const hasViewer = support(page.current, 'viewer');
        images_id++;
        return `
        <div id="mdoc_images_${images_id}" style="width:${options.width}px;">
        ${content.map(o=>`<img src="${o}" style="width:${options.width/options.col-2}px;height:${options.width/options.col-2}px;margin-right:2px;margin-bottom:2px;" >`).join('')}
        </div>
        ${hasViewer ? `
            <script>
            $(document).ready(function(){
                var viewer = new Viewer(document.getElementById("mdoc_images_${images_id}"), {
                    backdrop: 'static',
                    toolbar: {
                        prev: 1,
                        zoomOut: 1,
                        oneToOne: 1,
                        play: 1,
                        reset: 1,
                        zoomIn: 1,
                        next: 1,
                    },
                })
            })
            </script>
            ` : ''
        }
        `;
    };
};
