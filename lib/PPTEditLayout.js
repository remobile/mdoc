const React = require('react');
const MarkdownView = require('./MarkdownView');
const { support } = require('./utils');

class PPTEditLayout extends React.Component {
    render() {
        const { page } = this.props;
        page.edit = true;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="reveal.js/edit.css" />
                    <script type="text/javascript" src="reveal.js/edit.js"></script>
                    <script type="text/javascript" src="reveal.js/jscolor.js"></script>
                </head>
                <body>
                    <div id="history"></div>
                    <div id="info"></div>
                    <div id="container">
                        <MarkdownView source={page.content} page={page} container={null} />
                    </div>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
