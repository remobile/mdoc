'use strict';

const unescapeAll  = require('markdown-it/lib/common/utils').unescapeAll;
const has  = require('markdown-it/lib/common/utils').has;

module.exports = function sub_plugin(md, config) {
    const defaultRender = md.renderer.rules.fence;
    md.renderer.rules.fence_custom = {};
    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const info = token.info ? unescapeAll(token.info).trim() : '';
        const fences = info.split(/\s+/g);

        if (has(self.rules.fence_custom, fences[0])) {
            return self.rules.fence_custom[fences[0]](fences.slice(1).join(' '), tokens, idx, options, env, self);
        }

        return defaultRender(tokens, idx, options, env, self);
    };
};
