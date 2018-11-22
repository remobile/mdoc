'use strict';

const {md5} = require('../lib/utils');

module.exports = function link_plugin(md, config) {
    const _link_open = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const targetIndex = token.attrIndex('target');
        const hrefIndex = token.attrIndex('href');
        let href = token.attrs[hrefIndex][1];
        if (!/^https?:/.test(href)) {
            if (/^#/.test(href)) {
                href = `#${md5(href.slice(1))}`;
            } else if (/#/.test(href)) {
                let list = href.split('#');
                href = `${md5(list[0])}.html#${md5(decodeURI(list[1]))}`;
            } else {
                href = `${md5(href)}.html`;
            }
            token.attrs[hrefIndex][1] = href;
        }
        if (config.urlTarget !== '_self') {
            if (hrefIndex > -1) {
                if (config.urlTarget === '_blank') {
                    if (targetIndex < 0) {
                        token.attrPush(['target', '_blank']);
                    } else {
                        token.attrs[targetIndex][1] = '_blank';
                    }
                } else { // _auto
                    if (/^https?:/.test(href)) { // 外部链接 http(s):开头的都采用外部显示
                        if (targetIndex < 0) {
                            token.attrPush(['target', '_blank']);
                        } else {
                            token.attrs[targetIndex][1] = '_blank';
                        }
                    }
                }
            }
        }
        return _link_open(tokens, idx, options, env, self);
    };
};
