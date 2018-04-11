const React = require('react');
const Doc = require('./Doc');
const { getLink, support } = require('./utils');

class SingleDocLayout extends React.Component {
    render() {
        const { page, children } = this.props;

        return (
            <html>
                <body>
                    <Doc page={page} content={children} />
                </body>
            </html>
        );
    }
}

module.exports = SingleDocLayout;
