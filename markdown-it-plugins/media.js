'use strict';

module.exports = function sub_plugin(md, page) {
    const defaultRender = md.renderer.rules.image;
    const videoRegExp = page.config.videoRegExp || /\.(mp4|ogv)$/;
    const audioRegExp = page.config.audioRegExp || /\.(mp3|ogg)$/;

    md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const srcIndex = token.attrIndex('src');
        if (srcIndex > -1) {
            const videoIndex = token.attrIndex('video');
            const audioIndex = token.attrIndex('audio');
            if (videoIndex > -1) {
                token.tag = 'video';
                token.attrs.splice(videoIndex, 1);
            } else if (audioIndex > -1) {
                token.tag = 'audio';
                token.attrs.splice(audioIndex, 1);
                console.log(token);
            } else {
                const src = token.attrs[srcIndex][1];
                if (videoRegExp.test(src)) {
                    token.tag = 'video';
                } else if (audioRegExp.test(src)) {
                    token.tag = 'audio';
                }
            }
        }
        return defaultRender(tokens, idx, options, env, self);
    };
};
