const React = require('react');
const { support } = require('./utils');

// html head for each page
class Head extends React.Component {
    render() {
        const { current, config } = this.props.page;
        const { baseUrl, favicon, highlight ={} }  = config;
        const hl = Object.assign({ version: '9.12.0', theme: 'default'}, highlight);
        const hasToc = support(current, 'toc');

        return (
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <title>{current.name}</title>
                <meta name="viewport" content="width=device-width" />
                <link rel="shortcut icon" href={favicon} />
                <link rel="stylesheet" href={`//cdnjs.cloudflare.com/ajax/libs/highlight.js/${hl.version}/styles/${hl.theme}.min.css`} />
                <link rel="stylesheet" href={'css/main.css'} />
                { !hasToc && <link rel="stylesheet" href={'css/table.css'} /> }
                <script type="text/javascript" src={'js/jquery-1.4.4.min.js'} />
                {/* 是否支持ztree-toc */}
                { hasToc && <link rel="stylesheet" href="/simiantong/ztree_toc/zTreeStyle.css" /> }
                { hasToc && <script type="text/javascript" src="/simiantong/ztree_toc/jquery.ztree.core-3.5.min.js" /> }
                { hasToc && <script type="text/javascript" src="/simiantong/ztree_toc/ztree_toc.min.js" /> }
                { hasToc && <script dangerouslySetInnerHTML={{ __html: `$(document).ready(function(){$("#tree").ztree_toc({is_auto_number: true})})` }} /> }
                {/* External resources */}
                { config.styles && config.styles.map((o, k) => <link rel="stylesheet" key={'config.style' + k} href={o} />) }
                { config.scripts && config.scripts.map((o, k) => <script type="text/javascript" key={'config.script' + k} src={o} />) }
                { current.styles && current.styles.map((o, k) => <link rel="stylesheet" key={'current.style' + k} href={o} />) }
                { current.scripts && current.scripts.map((o, k) => <script type="text/javascript" key={'current.script' + k} src={o} />) }
            </head>
        );
    }
}

module.exports = Head;
