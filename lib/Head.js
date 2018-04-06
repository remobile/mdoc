const React = require('react');
const { support } = require('./utils');

// html head for each page
class Head extends React.Component {
    render() {
        const { current, config } = this.props.page;
        const { baseUrl, favicon, projectName, highlight ={} }  = config;
        const hl = Object.assign({ version: '9.12.0', theme: 'default'}, highlight);
        const hasTree = support(current, 'tree');
        const hasMath = support(current, 'math');
        const hasFlow = support(current, 'flow');
        const hasSequence= support(current, 'sequence');
        const hasChart = support(current, 'chart');

        return (
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <title>{current.name}</title>
                <meta name="viewport" content="width=device-width" />
                <link rel="shortcut icon" href={favicon} />
                <link rel="stylesheet" href={`//cdnjs.cloudflare.com/ajax/libs/highlight.js/${hl.version}/styles/${hl.theme}.min.css`} />
                <link rel="stylesheet" href={'css/main.css'} />
                <link rel="stylesheet" href={'css/table.css'} />
                <script type="text/javascript" src={'js/jquery-1.4.4.min.js'} />
                <script type="text/javascript" src={'js/underscore-min.js'} />
                {/* 是否支持ztree-toc */}
                { hasTree && <link rel="stylesheet" href={`/${projectName}/ztree_toc/zTreeStyle.css`} /> }
                { hasMath && <link rel="stylesheet" href={`/${projectName}/katex/katex.min.css`} /> }
                { hasTree && <script type="text/javascript" src={`/${projectName}/ztree_toc/jquery.ztree.core-3.5.min.js`} /> }
                { hasFlow && <script type="text/javascript" src={`/${projectName}/flowchart/raphael.min.js`} /> }
                { hasFlow && <script type="text/javascript" src={`/${projectName}/flowchart/flowchart.min.js`} /> }
                { hasSequence && <script type="text/javascript" src={`/${projectName}/sequence/webfont.js`} /> }
                { hasSequence && <script type="text/javascript" src={`/${projectName}/sequence/snap.svg-min.js`} /> }
                { hasSequence && <script type="text/javascript" src={`/${projectName}/sequence/sequence-diagram-min.js`} /> }
                { hasChart && <script type="text/javascript" src={`/${projectName}/echarts/echarts.min.js`} /> }
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
