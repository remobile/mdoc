const React = require('react');
const MarkdownView = require('./MarkdownView');
const { support } = require('./utils');


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
            transition,
            backgroundImage,
            disableLayout = false,
        } = this.props.config;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="reveal.js/reveal.min.css" />
                    { theme && <link rel="stylesheet" href={`reveal.js/theme/${theme}.css`} id="theme" /> }
                    <link rel="stylesheet" href="reveal.js/scale.css" />
                    <script type="text/javascript" src="reveal.js/scale.js"></script>
                </head>
                <body>
                    <div id="container" className="reveal">
                        <div className="slides">
                            {
                                pages.map((page, key)=>(
                                    <section key={key} data-transition={page.transition}>
                                        {
                                            typeof page.content === 'string' &&
                                            <MarkdownView source={page.content} page={page} container={Container} />
                                            ||
                                            page.content
                                        }
                                    </section>
                                ))
                            }
                        </div>
                    </div>
                    <script  type="text/javascript" src="reveal.js/reveal.min.js"></script>
                    <script  type="text/javascript"
                        dangerouslySetInnerHTML={{
                            __html: `
                            Reveal.initialize({
                                disableLayout: ${disableLayout},
                                transition: "${transition}",
                                parallaxBackgroundImage: "${backgroundImage}",
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
