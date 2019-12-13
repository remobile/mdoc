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
        const hasTabs = support(current, 'tabs');
        const hasReact = support(current, 'react');
        const hasAntd = support(current, 'antd');
        const hasUntree = support(current, 'untree');
        const hasMindmap = support(current, 'mindmap');
        const hasTagcloud = support(current, 'tagcloud');
        const hasRotateWord = support(current, 'rotateWord');
        const hasClockRotate = support(current, 'clockRotate');

        return (
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta http-equiv="ACCESS-CONTROL-ALLOW-ORIGIN" content="http://localhost:3000" />
                <meta name="viewport" content="width=device-width" />
                <title>{current.name}</title>
                <link rel="shortcut icon" href={favicon} />
                <link rel="stylesheet" href={`${theme}.css`} />
                <link rel="stylesheet" href={'css/main.css'} />
                <script type="text/javascript" src={'js/jquery-1.4.4.min.js'} />
                <script type="text/javascript" src={'js/lodash.js'} />
                {/* css*/}
                { hasTree && <link rel="stylesheet" href={'ztree_toc/zTreeStyle.css'} /> }
                { hasMath && <link rel="stylesheet" href={'katex/katex.min.css'} /> }
                { hasViewer && <link rel="stylesheet" href={'viewer/viewer.min.css'} /> }
                { hasSwiper && <link rel="stylesheet" href={'swiper/swiper.min.css'} /> }
                { hasAntd && <link rel="stylesheet" href={'antd/antd.css'} /> }
                { hasMindmap && <link rel="stylesheet" href={'mindmap/mindmap.css'} /> }
                { hasClockRotate && <link rel="stylesheet" href={'clockRotate/index.css'} /> }
                {/*js*/}
                { hasTree && <script type="text/javascript" src={'ztree_toc/jquery.ztree.core-3.5.min.js'} /> }
                { hasFlow && <script type="text/javascript" src={'flowchart/raphael.min.js'} /> }
                { hasFlow && <script type="text/javascript" src={'flowchart/flowchart.min.js'} /> }
                { hasSequence && <script type="text/javascript" src={'sequence/webfont.js'} /> }
                { hasSequence && <script type="text/javascript" src={'sequence/snap.svg-min.js'} /> }
                { hasSequence && <script type="text/javascript" src={'sequence/sequence-diagram-min.js'} /> }
                { hasChart && <script type="text/javascript" src={'echarts/echarts.min.js'} /> }
                { hasViewer && <script type="text/javascript" src={'viewer/viewer.min.js'} /> }
                { hasSwiper && <script type="text/javascript" src={'swiper/swiper.min.js'} /> }
                { hasTabs && <script type="text/javascript" src={'tabs/jquery.tabs.js'} /> }
                { (hasReact || hasAntd) && <script type="text/javascript" src={'react/react.min.js '} /> }
                { (hasReact || hasAntd) && <script type="text/javascript" src={'react/react-dom.min.js'} /> }
                { hasAntd && <script type="text/javascript" src={'antd/antd.js'} /> }
                { hasUntree && <script type="text/javascript" src={'untree/untree.min.js'} /> }
                { hasMindmap && <script type="text/javascript" src={'mindmap/d3_flex_tree.js'} /> }
                { hasMindmap && <script type="text/javascript" src={'mindmap/mindmap.js'} /> }
                { hasTagcloud && <script type="text/javascript" src={'tagcloud/tagcanvas.js'} /> }
                { hasRotateWord && <script type="text/javascript" src={'rotateWord/index.js'} /> }
                { hasClockRotate && <script type="text/javascript" src={'clockRotate/index.js'} /> }
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
