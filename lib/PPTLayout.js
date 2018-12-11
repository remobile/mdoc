const React = require('react');
const MarkdownBlock = require('./MarkdownBlock');
const { support } = require('./utils');

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
                </head>
                <body>
                    <div className="reveal">
                        <div className="slides">
                            {
                                pages.map((page, key)=>(
                                    <section data-transition={page.transition}>
                                        {
                                            typeof page.content === 'string' &&
                                            <MarkdownBlock key={key} page={page}>{page.content}</MarkdownBlock>
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
