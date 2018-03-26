'use strict';

function my_text(state, startLine, endLine/*, silent*/) {
    var nextLine, last, token;
    if (state.sCount[startLine] - state.blkIndent < 1) { return false; }

    last = nextLine = startLine + 1;

    while (nextLine < endLine) {
        if (state.isEmpty(nextLine)) {
            nextLine++;
            continue;
        }

        if (state.sCount[nextLine] - state.blkIndent >= 1) {
            nextLine++;
            last = nextLine;
            continue;
        }
        break;
    }

    state.line = last;

    token = state.push('text', '', 0);
    token.content = state.getLines(startLine, last, state.blkIndent, true);
    token.map = [ startLine, state.line ];

    return true;
}

module.exports = function (md, options) {
    md.block.ruler.after('code', 'my_text', my_text);
};
