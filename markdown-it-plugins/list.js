'use strict';

module.exports = function(md) {
    md.core.ruler.before('inline', 'ordered_list_attr', function(state) {
        const tokens = state.tokens;
        for (const token of tokens) {
            if (token.type !== 'ordered_list_open') {
                continue;
            }
            const type = token.level === 0 ? '1' : token.level === 2 ? 'a' : 'i';
            !token.attrs && (token.attrs = []);
            token.attrs.push([ 'type', type ]);
            console.log(token);
        }
    });
};
