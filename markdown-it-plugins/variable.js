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

        if (pos + 2 >= max) {
            return false;
        }
        if (state.src.charCodeAt(pos++) !== 0x2A/* * */) {
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
        if (!state.env.variable_reviations) {
             return;
         }
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
    function abbr_replace(state) {
        if (!state.env.variable_reviations) {
            return;
        }

        const regSimple = new RegExp('(?:' +
        Object.keys(state.env.variable_reviations).map(function (x) {
            return x.substr(1, x.length-2);
        }).sort(function (a, b) {
            return b.length - a.length;
        }).map(escapeRE).join('|') +
        ')');

        const regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
        '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])'
        + '(' + Object.keys(state.env.variable_reviations).map(function (x) {
            return x.substr(1, x.length-2);
        }).sort(function (a, b) {
            return b.length - a.length;
        }).map(escapeRE).join('|') + ')'
        + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
        '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

        const reg = new RegExp(regText, 'g');

        for (const blockToken of state.tokens) {
            if (blockToken.type !== 'inline') {
                continue;
            }
            let tokens = blockToken.children;

            // We scan from the end, to keep position when new tags added.
            for (let i = tokens.length - 1; i >= 0; i--) {
                const currentToken = tokens[i];
                if (currentToken.type !== 'text') {
                    continue;
                }

                let m;
                let pos = 0;
                const nodes = [];
                const text = currentToken.content;
                reg.lastIndex = 0;

                // fast regexp run to determine whether there are any abbreviated words
                // in the current token
                if (!regSimple.test(text)) {
                    continue;
                }

                while ((m = reg.exec(text))) {
                    if (m.index > 0 || m[1].length > 0) {
                        const preToken = new state.Token('text', '', 0);
                        preToken.content = text.slice(pos, m.index + m[1].length);
                        nodes.push(preToken);
                    }

                    const openToken = new state.Token('abbr_open', 'abbr', 1);
                    openToken.attrs = [['title', state.env.variable_reviations[`[${m[2]}]`]]];
                    nodes.push(openToken);

                    const innerToken = new state.Token('text', '', 0);
                    innerToken.content = m[2];
                    nodes.push(innerToken);

                    const closeToken = new state.Token('abbr_close', 'abbr', -1);
                    nodes.push(closeToken);

                    reg.lastIndex -= m[3].length;
                    pos = reg.lastIndex;
                }

                if (!nodes.length) {
                    continue;
                }

                if (pos < text.length) {
                    const token = new state.Token('text', '', 0);
                    token.content = text.slice(pos);
                    nodes.push(token);
                }

                // replace current node
                blockToken.children = tokens = arrayReplaceAt(tokens, i, nodes);
            }
        }
    }

    md.block.ruler.before('reference', 'variable_def', variable_def, { alt: [ 'paragraph', 'reference'] });
    md.core.ruler.before('inline', 'variable_replace', variable_replace);
    md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
};
