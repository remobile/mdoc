'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;

module.exports = function artical_plugin(md) {
    let flow_id = 0;
    md.renderer.rules.fence_custom.artical = function(params, tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o);
        const options = {};
        for (const item of content) {
            const pair = item.split('=');
            options[pair[0]] = pair[1];
        }
        return renderToStaticMarkup(
            <div>
                <div className='title'>{options.title}</div>
                <div>
                    <span className='author'>{options.author}</span>
                    <span className='seprator'>|</span>
                    <span className='date'>{options.date}</span>
                </div>
            </div>
        );
    };
};
