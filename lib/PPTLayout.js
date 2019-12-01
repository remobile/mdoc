const React = require('react');
const path = require('path');
const fs = require('fs');
const MarkdownView = require('./MarkdownView');
const { support } = require('./utils');
const CWD = process.cwd() + '/';

class Container extends React.Component {
    render() {
        return <div className="ppt-frame">{this.props.children}</div>
    }
}

class PPTLayout extends React.Component {
    render() {
        const {
            theme,
            pages,
            vertical,
            transition,
            backgroundImage,
        } = this.props.config;
        const content = pages.map((page, key)=>(
            <section key={key} data-transition={page.transition}>
                {
                    typeof page.content === 'string' &&
                    <MarkdownView source={page.content} page={page} container={Container} />
                    ||
                    page.content
                }
            </section>
        ));
        const parallaxBackgroundImage = 'data:image/'+path.extname(backgroundImage).substr(1)+';base64,' + fs.readFileSync(CWD + 'static/' + backgroundImage).toString("base64");
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="reveal.js/reveal.css" />
                    <link rel="stylesheet" href="reveal.js/scale.css" />
                    <script type="text/javascript" src="reveal.js/scale.js"></script>
                </head>
                <body>
                    <div id="container" className="reveal">
                        <div className="slides">
                            {vertical ? <section>{content}</section> : content}
                        </div>
                    </div>
                    <script  type="text/javascript" src="reveal.js/reveal.js"></script>
                    <script  type="text/javascript"
                        dangerouslySetInnerHTML={{
                            __html: `
                            Reveal.initialize({
                                disableLayout: true,
                                transition: "${transition}",
                                parallaxBackgroundImage: "${parallaxBackgroundImage}",
                            });
                            `,
                        }}
                        />
                </body>
            </html>
        );
    }
}

module.exports = PPTLayout;
