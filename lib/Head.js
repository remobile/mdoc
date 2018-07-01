const React = require('react');
const { support } = require('./utils');

// html head for each page
class Head extends React.Component {
    render() {
        const { current, config } = this.props.page;
        const { favicon, highlight }  = config;
        const theme = highlight && highlight.theme || 'default';
        const hasTree = support(current, 'tree');
        const hasMath = support(current, 'math');
        const hasFlow = support(current, 'flow');
        const hasSequence= support(current, 'sequence');
        const hasChart = support(current, 'chart');
        const hasViewer = support(current, 'viewer');
        const hasSwiper = support(current, 'swiper');
        const hasReact = support(current, 'react');

        return (
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <title>{current.name}</title>
                <meta name="viewport" content="width=device-width" />
                <link rel="shortcut icon" href={favicon} />
                <link rel="stylesheet" href={`${theme}.css`} />
                <link rel="stylesheet" href={`css/main.css`} />
                <script type="text/javascript" src={`js/jquery-1.4.4.min.js`} />
                <script type="text/javascript" src={`js/underscore-min.js`} />
                {/* 是否支持ztree-toc */}
                { hasTree && <link rel="stylesheet" href={`ztree_toc/zTreeStyle.css`} /> }
                { hasMath && <link rel="stylesheet" href={`katex/katex.min.css`} /> }
                { hasViewer && <link rel="stylesheet" href={`viewer/viewer.min.css`} /> }
                { hasSwiper && <link rel="stylesheet" href={`swiper/swiper.min.css`} /> }
                { hasTree && <script type="text/javascript" src={`ztree_toc/jquery.ztree.core-3.5.min.js`} /> }
                { hasFlow && <script type="text/javascript" src={`flowchart/raphael.min.js`} /> }
                { hasFlow && <script type="text/javascript" src={`flowchart/flowchart.min.js`} /> }
                { hasSequence && <script type="text/javascript" src={`sequence/webfont.js`} /> }
                { hasSequence && <script type="text/javascript" src={`sequence/snap.svg-min.js`} /> }
                { hasSequence && <script type="text/javascript" src={`sequence/sequence-diagram-min.js`} /> }
                { hasChart && <script type="text/javascript" src={`echarts/echarts.min.js`} /> }
                { hasViewer && <script type="text/javascript" src={`viewer/viewer.min.js`} /> }
                { hasSwiper && <script type="text/javascript" src={`swiper/swiper.min.js`} /> }
                { hasReact && <script type="text/javascript" src={`react/react.min.js `} /> }
                { hasReact && <script type="text/javascript" src={`react/react-dom.min.js`} /> }
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
