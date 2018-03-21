const React = require('react');
const MarkdownBlock = require('./MarkdownBlock.js');
const { support } = require('./utils');

class Doc extends React.Component {
    render() {
        const { page, content } = this.props;
        const hasToc = support(page.current, 'toc');

        return (
            !hasToc &&
            <div className="post">
                <article>
                    { typeof content === 'object' && content || <MarkdownBlock>{content}</MarkdownBlock> }
                </article>
            </div>
            ||
            <table width={1100}>
                <tbody>
                    <tr>
                        <td width={260}  style={{borderRight: '#999999 1px dashed'}}>
                            <ul id="tree" className="ztree" />
                        </td>
                        <td width={740} style={{paddingLeft: 40}}>
                            { typeof content === 'object' && content || <MarkdownBlock>{content}</MarkdownBlock> }
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

module.exports = Doc;
