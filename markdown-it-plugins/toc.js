'use strict';

const ANCHOR_SVG = '<svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>';

module.exports = function(md) {
    let gstate;
    let hasToc = false;
    const options = {};

    function getSerial(serialPool, level) {
        let list = [];
        for (const l in serialPool) {
            list.push(serialPool[l]);
            if (l == level) {
                break;
            }
        }
        return list;
    }
    function toc_block(state, startLine, endLine, silent) {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        const text = state.src;

        if (pos + 5 > max) {
            return false;
        }
        if(text.slice(pos, pos + 5) !== '[TOC]') {
            return false;
        }
        pos += 5;
        let params = text.slice(pos, max).split(' ').filter(o=>o);
        if (params.indexOf('number') !== -1) {
            options.autoNumber = true;
        }
        if (params.indexOf('tree') !== -1) {
            options.ztree = true;
        }
        params = params.filter(o=>o!=='tree'&&o!=='number');
        options.width = +params[0] || 250;

        state.line = startLine + 1;

        let token;
        if (options.ztree) {
            token = state.push('toc_ztree_start', '', 0);
        } else {
            token = state.push('toc_body', '', 0);
        }
        token.map = [ startLine, state.line ];

        hasToc = true;

        return true;
    }
    md.renderer.rules.heading_open = function(tokens, idx) {
        const { serial, toc_id, head_id, level } = tokens[idx].toc;
        if (hasToc) {
            return (
                `
                <h${level}>
                <a class="anchor" aria-hidden="true" id="${head_id}"></a>
                ${options.ztree ? '' : `<a href="#${toc_id}" aria-hidden="true" class="hash-link" >${ANCHOR_SVG}</a>`}
                ${options.autoNumber ? `<span style="margin-right: 10px;">${serial}</span>` : ''}
                `
            );
        }
        return `<h${level}>`;
    };

    md.renderer.rules.toc_ztree_tail = function(tokens, index) {
        return '</div></div>';
    };
    md.renderer.rules.toc_ztree_start = function(tokens, index) {
        const setting = {
			view: {
				dblClickExpand: false,
				showLine: true,
				showIcon: false,
				selectedMulti: false,
			},
			data: {
				simpleData: {
					enable: true,
					idKey : "id",
					pIdKey: "pId",
				},
			},
		};
        return (
            `<div style="display:flex;width: 100%;">
                <div style="width:${options.width}px;"></div>
            	<div style="float:left;width:${options.width}px;position:fixed;">
                    <ul id="toc_root" class="ztree"><ul>
                    <script>
                        $(document).ready(function(){
                			$.fn.zTree.init($("#toc_root"), ${JSON.stringify(setting)}, ${JSON.stringify(gstate.zNodes)});
                		});
                    </script>
                </div>
                <div style="flex:1;">`
        );
    };
    md.renderer.rules.toc_body = function(tokens, index) {
        let indent = 0;
        const headings = gstate.tokens.filter(o => o.type === 'heading_open');

        const list = headings.map(o => {
            const { serial, toc_id, head_id, name, level } = o.toc;
            const res = [];
            if (level > indent) {
                const ldiff = (level - indent);
                for (let i = 0; i < ldiff; i++) {
                    res.push('<ul class="ztree">');
                    indent++;
                }
            } else if (level < indent) {
                const ldiff = (indent - level);
                for (let i = 0; i < ldiff; i++) {
                    res.push('</ul>');
                    indent--;
                }
            }
            res.push(`<li style="list-style:none;"><a class="anchor" aria-hidden="true" href="#${head_id}" id="${toc_id}">${options.autoNumber ? `<span style="margin-right: 12px;">${serial}</span>` : ''}${name}</a></li>`);
            return res.join('');
        });


        return list.join('') + new Array(indent + 1).join('</ul>');
    };

    md.core.ruler.push('grab_state', function(state) {
        const serialPool = {};
        const tokens = state.tokens;
        let lastLevel = 0;
        const zNodes = [{ id: 'toc_id_0', name: "目录", open: true}];

        for (const i in tokens) {
            const token = tokens[i];
            if (token.type !== 'heading_open') {
                continue;
            }
            const level = +token.tag.substr(1, 1);
            if (lastLevel < level) {
                serialPool[level] = 1;
            } else {
                serialPool[level]++;
            }
            lastLevel = level;
            const serialList = getSerial(serialPool, level);
            const serial = serialList.join('.');
            const serialId = serialList.join('_');
            const toc_id = `toc_id_${serialId}`;
            const toc_parent_id = `toc_id_${serialList.slice(0, -1).join('_') || 0}`;
            const head_id = `head_id_${serialId}`;
            const name = tokens[+i+1].content;
            token.toc = {
                serial,
                name,
                toc_id,
                head_id,
                level,
            }
            options.ztree && zNodes.push({
                id: toc_id,
                pId: toc_parent_id,
                name: (options.autoNumber ? serial + '    ' : '') + name,
                open: true,
                url: `#${head_id}`,
                target:'_self'
            });
        }
        if (hasToc && options.ztree) {
            tokens.push({type: 'toc_ztree_tail', tag: '',  nesting: 0});
            state.zNodes = zNodes;
        }

        gstate = state;
    });
    md.block.ruler.before('table', 'toc_block', toc_block);
};
