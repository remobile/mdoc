const React = require('react');
const MarkdownBlock = require('./MarkdownBlock');

class Doc extends React.Component {
    render() {
        const { page, content } = this.props;
        return (
            <div className="post">
                <article>
                    { typeof content === 'object' && content || <MarkdownBlock>{content}</MarkdownBlock> }
                </article>
            </div>
        );
    }
}

module.exports = Doc;
