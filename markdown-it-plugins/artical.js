'use strict';
const React = require('react');
const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const { parseParams } = require('../lib/utils');

module.exports = function artical_plugin(md) {
    let flow_id = 0;
    md.renderer.rules.fence_custom.artical = function(params, tokens, idx) {
        const content = tokens[idx].content.split('\n').filter(o=>!!o).join(' ');
        const options = parseParams(content);
        const titles = options.title.split('|');
        return renderToStaticMarkup(
            <div>
                <div className='title'>
                    { titles.map((t, k)=><div key={k}>{t}</div>) }
                </div>
                <div>
                    <span className='author'>{options.author}</span>
                    <span className='seprator'>|</span>
                    <span className='date'>{options.date}</span>
                </div>
            </div>
        );
    };
};
