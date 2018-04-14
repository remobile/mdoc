const React = require('react');
const Doc = require('./Doc');
const { support } = require('./utils');

class SingleDocLayout extends React.Component {
    render() {
        const { page, children } = this.props;
        const { current, config } = page;
        const { name, favicon, styles, scripts } = current;
        const { highlight }  = config;
        const theme = highlight && highlight.theme || 'default';
        const hasMain = support(current, 'main');
        const hasCode = support(current, 'code');
        const hasJquery = support(current, 'jquery');
        const hasUnderscore = support(current, '_');
        const hasTree = support(current, 'tree');
        const hasMath = support(current, 'math');
        const hasFlow = support(current, 'flow');
        const hasSequence= support(current, 'sequence');
        const hasChart = support(current, 'chart');

        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    {name && <title>{name}</title>}
                    {favicon && <link rel="shortcut icon" href={favicon} />}
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width" />
                    { hasMain && <link rel="stylesheet" href={'css/main.css'} /> }
                    { hasCode && <link rel="stylesheet" href={`${theme}.css`} /> }
                    { hasJquery && <script type="text/javascript" src={`js/jquery-1.4.4.min.js`} /> }
                    { hasUnderscore && <script type="text/javascript" src={`js/underscore-min.js`} /> }
                    { hasTree && <link rel="stylesheet" href={`ztree_toc/zTreeStyle.css`} /> }
                    { hasMath && <link rel="stylesheet" href={`katex/katex.min.css`} /> }
                    { hasTree && <script type="text/javascript" src={`ztree_toc/jquery.ztree.core-3.5.min.js`} /> }
                    { hasFlow && <script type="text/javascript" src={`flowchart/raphael.min.js`} /> }
                    { hasFlow && <script type="text/javascript" src={`flowchart/flowchart.min.js`} /> }
                    { hasSequence && <script type="text/javascript" src={`sequence/webfont.js`} /> }
                    { hasSequence && <script type="text/javascript" src={`sequence/snap.svg-min.js`} /> }
                    { hasSequence && <script type="text/javascript" src={`sequence/sequence-diagram-min.js`} /> }
                    { hasChart && <script type="text/javascript" src={`echarts/echarts.min.js`} /> }
                    { styles && styles.map((o, k) => <link rel="stylesheet" key={'style' + k} href={o} />) }
                    { scripts && scripts.map((o, k) => <script type="text/javascript" key={'script' + k} src={o} />) }
                </head>
                <body>
                    <Doc page={page} content={children} />
                </body>
            </html>
        );
    }
}

module.exports = SingleDocLayout;
