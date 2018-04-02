
'use strict';


module.exports = function sub_plugin(md) {
    const escapeRE = md.utils.escapeRE;
    const arrayReplaceAt = md.utils.arrayReplaceAt;
    const OTHER_CHARS      = ' \r\n$+<=>^`|~';
    const UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
    const UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;


    function variable_def(state, startLine, endLine, silent) {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];

        if (pos + 1 >= max) {
            return false;
        }

        if (state.src.charCodeAt(pos++) !== 0x5B/* [ */) {
            return false;
        }

        const labelStart = pos;
        let labelEnd;

        for (; pos < max; pos++) {
            const ch = state.src.charCodeAt(pos);
            if (ch === 0x5B /* [ */) {
                return false;
            } else if (ch === 0x5D /* ] */) {
                labelEnd = pos;
                break;
            } else if (ch === 0x5C /* \ */) {
                pos++;
            }
        }

        if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A/* : */) {
            return false;
        }

        if (silent) { return true; }

        const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
        const title = state.src.slice(labelEnd + 2, max).trim();
        if (label.length === 0) { return false; }
        if (title.length === 0) { return false; }
        if (!state.env.variable_reviations) { state.env.variable_reviations = {}; }
        if (typeof state.env.variable_reviations[`[${label}]`] === 'undefined') {
            state.env.variable_reviations[`[${label}]`] = title;
        }

        state.line = startLine + 1;
        return true;
    }


    function variable_replace(state) {
        if (!state.env.variable_reviations) { return; }
        const regSimple = new RegExp('(?:' +
        Object.keys(state.env.variable_reviations).map(function (x) {
            return x;
        }).sort(function (a, b) {
            return b.length - a.length;
        }).map(escapeRE).join('|') +
        ')');

        const regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
        '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])'
        + '(' + Object.keys(state.env.variable_reviations).map(function (x) {
            return x;
        }).sort(function (a, b) {
            return b.length - a.length;
        }).map(escapeRE).join('|') + ')'
        + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
        '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

        const reg = new RegExp(regText, 'g');

        for (const token of state.tokens) {
            let m;
            let pos = 0;
            let content = '';
            const text = token.content;
            reg.lastIndex = 0;

            if (token.type !== 'inline') {
                continue;
            }

            if (!regSimple.test(text)) {
                continue;
            }

            while ((m = reg.exec(text))) {
                if (m.index > 0 || m[1].length > 0) {
                    content += text.slice(pos, m.index + m[1].length);
                }
                content += state.env.variable_reviations[m[2]];

                reg.lastIndex -= m[3].length;
                pos = reg.lastIndex;
            }
            if (pos < text.length) {
                content += text.slice(pos);
            }
            token.content = content;
        }
    }

    md.block.ruler.before('reference', 'variable_def', variable_def, { alt: [ 'paragraph', 'reference'] });
    md.core.ruler.before('inline', 'variable_replace', variable_replace);
};
