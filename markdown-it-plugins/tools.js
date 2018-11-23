'use strict';

const { parseParams, encodeURIParams } = require('../lib/utils');

module.exports = function(md, page) {
    const projectName = page.config.projectName;
    function tools_block(state, startLine, endLine, silent) {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        const text = state.src;

        let tag;
        if (text.slice(pos, pos + 10) === '[CALENDAR]') {
            tag = 'CALENDAR';
            pos += 10;
        } else if (text.slice(pos, pos + 6) === '[TIME]') {
            tag = 'TIME';
            pos += 6;
        } else if (text.slice(pos, pos + 7) === '[CLOCK]') {
            tag = 'CLOCK';
            pos += 7;
        } else if (text.slice(pos, pos + 10) === '[COUPLETS]') {
            tag = 'COUPLETS';
            pos += 10;
        }
        if (!tag) {
            return false;
        }
        state.line = startLine + 1;

        const token = state.push('tools_renderer', tag, 0);
        token.map = [ startLine, state.line ];
        token.content = text.slice(pos, max);

        return true;
    }
    md.renderer.rules.tools_renderer = function(tokens, index) {
        const { tag, content } = tokens[index];
        const params = parseParams(content);

        if (tag === 'CALENDAR') {
            return `<iframe width="772px" height="370px" scrolling="no" frameborder="0" src="/${projectName}/tools/calendar.html"></iframe>`;
        }
        if (tag === 'TIME') {
            return `<iframe width="538px" height="100px" scrolling="no" frameborder="0" src="/${projectName}/tools/time.html"></iframe>`;
        }
        if (tag === 'CLOCK') {
            return `<iframe width="250px" height="250px" scrolling="no" frameborder="0" src="/${projectName}/tools/clock.html"></iframe>`;
        }
        if (tag === 'COUPLETS') {
            return `<iframe width="${params.width}px" height="${params.height}px" scrolling="no" frameborder="0" src="/${projectName}/tools/couplets.html?${encodeURIParams(params)}"></iframe>`;
        }
    };
    md.block.ruler.before('paragraph', 'tools_block', tools_block);
};
