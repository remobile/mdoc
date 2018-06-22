const React = require('react');
const MarkdownBlock = require('./MarkdownBlock');

class Doc extends React.Component {
    render() {
        const { page, content } = this.props;
        const { container } = page.current;
        return (
            <div className="post">
                <article>
                    {
                        container ?
                        React.createElement(container.dom || 'div', container.props, typeof content === 'object' && content || <MarkdownBlock page={page}>{content}</MarkdownBlock>)
                        :
                        ( typeof content === 'object' && content || <MarkdownBlock page={page}>{content}</MarkdownBlock> )
                    }
                </article>
            </div>
        );
    }
}

module.exports = Doc;
