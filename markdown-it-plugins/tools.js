'use strict';

module.exports = function(md) {
    function tools_block(state, startLine, endLine, silent) {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        const text = state.src;

        let tag;
        if (text.slice(pos, pos + 10) === '[CALENDER]') {
            tag = 'CALENDER';
            pos += 10;
        } else if (text.slice(pos, pos + 6) === '[TIME]') {
            tag = 'TIME';
            pos += 6;
        }
        if (!tag) {
            return false;
        }
        state.line = startLine + 1;

        const token = state.push('tools_renderer', tag, 0);
        token.map = [ startLine, state.line ];

        return true;
    }
    md.renderer.rules.tools_renderer = function(tokens, index) {
        const { tag } = tokens[index];

        if (tag === 'CALENDER') {
            return `<iframe width="772px" height="370px" scrolling="no" frameborder="0" src="/mdoc-example/tools/calendar.html"></iframe>`;
        }
    };
    md.block.ruler.before('paragraph', 'tools_block', tools_block);
};
