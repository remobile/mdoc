
'use strict';


module.exports = function sub_plugin(md, config) {
    const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    if (config.urlTarget !== '_self') {
        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const targetIndex = token.attrIndex('target');
            const hrefIndex = token.attrIndex('href');
            if (hrefIndex > -1) {
                if (config.urlTarget === '_blank') {
                    if (targetIndex < 0) {
                        token.attrPush(['target', '_blank']);
                    } else {
                        token.attrs[targetIndex][1] = '_blank';
                    }
                } else { // _auto
                    const href = token.attrs[hrefIndex][1];
                    if (/^https?:/.test(href)) { // 外部链接 http(s):开头的都采用外部显示
                        if (targetIndex < 0) {
                            token.attrPush(['target', '_blank']);
                        } else {
                            token.attrs[targetIndex][1] = '_blank';
                        }
                    }
                }
            }
            return defaultRender(tokens, idx, options, env, self);
        };
    }
};
