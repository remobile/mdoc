const React = require('react');
const MarkdownView = require('./MarkdownView');
const { support } = require('./utils');

class PPTEditLayout extends React.Component {
    render() {
        const { page } = this.props;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <link rel="stylesheet" href="reveal.js/edit.css" />
                    <script  type="text/javascript" src="reveal.js/edit.js"></script>
                </head>
                <body>
                    <MarkdownView source={page.content} page={page} container={null} />
                    <div id="referent">
                        <div className="referent" id="referent_center_up"></div>
                        <div className="referent" id="referent_center_down"></div>
                        <div className="referent" id="referent_left_up"></div>
                        <div className="referent" id="referent_right_up"></div>
                        <div className="referent" id="referent_left_down"></div>
                        <div className="referent" id="referent_right_down"></div>
                        <div className="referent" id="referent_left_middle"></div>
                        <div className="referent" id="referent_right_middle"></div>
                    </div>
                </body>
            </html>
        );
    }
}

module.exports = PPTEditLayout;
