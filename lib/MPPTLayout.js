const React = require('react');
const MarkdownView = require('./MarkdownView');

class Container extends React.Component {
    render() {
        return <div className="ppt-frame">{this.props.children}</div>
    }
}

class PPTLayout extends React.Component {
    render() {
        const {
            pages,
        } = this.props.config;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
                    <link rel="stylesheet" href="ppt/css/animate.css" />
                    <link rel="stylesheet" href="ppt/css/mppt.css" />
                </head>
                <body>
                    <div id="container">
                        <div id="audio_button" className="rotate">
                			<audio id="audio" src="audio/mppt.mp3" loop preload autoplay></audio>
                		</div>
                        <div className="arrow-wrap">
                			<div className="arrow1"></div>
                			<div className="arrow2"></div>
                		</div>
                        {
                            pages.map((page, key)=>(
                                <div key={key} className="page">
                                    {
                                        typeof page.content === 'string' &&
                                        <MarkdownView source={page.content} page={page} container={Container} />
                                        ||
                                        page.content
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <script type="text/javascript" src="js/zepto.js"></script>
                    <script type="text/javascript" src="ppt/js/page.js"></script>
                    <script type="text/javascript" src="ppt/js/mppt.js"></script>
                    <script type="text/javascript"
                        dangerouslySetInnerHTML={{
                            __html: `Zepto(initPage)`,
                        }}
                        />
                </body>
            </html>
        );
    }
}

module.exports = PPTLayout;
