'use strict';

const _ = require('lodash');
const ANCHOR_SVG = '<svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>';

module.exports = function(md) {
    let gstate;
    let hasToc = false;
    const settings = {};

    function getSerial(serialPool, level) {
        if (_.includes(settings.disableNumberList, level)) {
            return [];
        }
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
        const numberParam =  _.find(params, o=>/^number.*/.test(o));
        settings.disableNumberList = [];
        if (numberParam) {
            settings.autoNumber = true;
            const list = numberParam.split('=')[1];
            if (list) {
                settings.disableNumberList = _.map(list.split(/[,，]/), o=>-o);
            }
        }
        const treeParam =  _.find(params, o=>/^tree.*/.test(o));
        if (treeParam) {
            settings.ztree = true;
            settings.width = +(treeParam.split('=')[1]) || 250;
        }
        settings.disableList = [];
        const disableParam =  _.find(params, o=>/^disable=.*/.test(o));
        if (disableParam) {
            const list = disableParam.split('=')[1];
            if (list) {
                settings.disableList = _.map(list.split(/[,，]/), o=>+o);
            }
        }

        state.line = startLine + 1;

        const token = state.push('toc_ztree_start', '', 0);
        token.map = [ startLine, state.line ];
        !hasToc && (hasToc = true);

        return true;
    }
    md.renderer.rules.heading_open = function(tokens, idx, options, env, slf) {
        const token = tokens[idx];
        if (token.toc) {
            const { serial, toc_id, head_id, level } = token.toc;
            return (
                `
                <h${level} ${slf.renderAttrs(token)}>
                <a class="anchor" aria-hidden="true" id="${head_id}"></a>
                ${settings.ztree ? '' : `<a href="#${toc_id}" aria-hidden="true" class="hash-link" >${ANCHOR_SVG}</a>`}
                ${settings.autoNumber ? `<span style="margin-right: 10px;">${serial}</span>` : ''}
                `
            );
        }
        return `<${token.tag} ${slf.renderAttrs(token)}>`;
    };

    md.renderer.rules.toc_ztree_tail = function(tokens, index) {
        return '</div></div>';
    };
    md.renderer.rules.toc_ztree_start = function(tokens, index) {
        let indent = 0;
        const headings = gstate.tokens.filter(o => o.type === 'heading_open');
        const list = headings.map(o => {
            if (!o.toc) {
                return '';
            }
            const { serial, toc_id, head_id, name, level } = o.toc;
            const res = [];
            if (level > indent) {
                const ldiff = (level - indent);
                for (let i = 0; i < ldiff; i++) {
                    res.push('<ul>');
                    indent++;
                }
            } else if (level < indent) {
                const ldiff = (indent - level);
                for (let i = 0; i < ldiff; i++) {
                    res.push('</ul>');
                    indent--;
                }
            }
            res.push(`<li><a class="anchor" aria-hidden="true" href="#${head_id}" id="${toc_id}">${settings.autoNumber ? `<span style="margin-right: 12px;">${serial}</span>` : ''}${name}</a></li>`);
            return res.join('');
        });

        const toc_html = '<div class="mdoc_toc_list">'+list.join('') + new Array(indent + 1).join('</ul>')+'</div>';
        if (!settings.ztree) {
            return toc_html;
        }
        const ztree_setting = {
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
            `
            ${toc_html}
            <div id="mdoc_toc_container">
            <style>code{max-width:800px;}</style>
            <div id="mdoc_toc_sidebar" style="width:${settings.width}px;"></div>
            <div id="mdoc_toc_menu" style="float:left;width:${settings.width-80}px;position:fixed;max-height:80%;overflow:scroll;">
            <ul id="toc_root" class="ztree"><ul>
            <script>
            $(document).ready(function(){
                if ($(window).width()<=735) {
                    $(".mdoc_toc_list").show();
                    $("#mdoc_toc_sidebar").hide();
                    $("#mdoc_toc_menu").hide();
                } else {
                    $(".mdoc_toc_list").hide();
                    $.fn.zTree.init($("#toc_root"), ${JSON.stringify(ztree_setting)}, ${JSON.stringify(gstate.zNodes)});
                }
            });
            </script>
            </div>
            <div style="flex:1;">
            `
        );
    };
    md.core.ruler.push('grab_state', function(state) {
        const serialPool = {};
        const tokens = state.tokens;
        let lastLevel = 0;
        const zNodes = [{ id: 'toc_id_0', name: "目录", open: true}];

        if (!hasToc) {
            return;
        }
        for (const i in tokens) {
            const token = tokens[i];
            if (token.type !== 'heading_open') {
                continue;
            }
            const level = +token.tag.substr(1, 1);
            if (_.includes(settings.disableList, level)) {
                continue;
            }
            if (!_.includes(settings.disableNumberList, level)) {
                if (lastLevel < level) {
                    serialPool[level] = 1;
                } else {
                    serialPool[level]++;
                }
                lastLevel = level;
            }
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
            settings.ztree && zNodes.push({
                id: toc_id,
                pId: toc_parent_id,
                name: (settings.autoNumber ? serial + '    ' : '') + name,
                open: true,
                url: `#${head_id}`,
                target:'_self'
            });
        }
        if (settings.ztree) {
            tokens.push({type: 'toc_ztree_tail', tag: '',  nesting: 0});
            state.zNodes = zNodes;
        }

        gstate = state;
    });
    md.block.ruler.before('table', 'toc_block', toc_block);
};
