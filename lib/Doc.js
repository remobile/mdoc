const React = require('react');
const MarkdownBlock = require('./MarkdownBlock');
const { support } = require('./utils');

class Doc extends React.Component {
    render() {
        const { page, content } = this.props;
        const { container, fullPath } = page.current;
        const hasDir = support(page.current, 'dir');
        return (
            <div className="post">
                <article style={{overflow: 'scroll'}}>
                    {
                        hasDir ? (

                        ) : (
                            container ?
                            React.createElement(container.dom || 'div', container.props, typeof content === 'object' && content || <MarkdownBlock page={page}>{content}</MarkdownBlock>)
                            :
                            ( typeof content === 'object' && content || <MarkdownBlock page={page}>{content}</MarkdownBlock> )
                        )
                    }
                </article>
            </div>
        );
    }
}

module.exports = Doc;
