const React = require('react');
const MarkdownView = require('./MarkdownView');

class MarkdownBlock extends React.Component {
    render() {
        return <MarkdownView source={this.props.children} page={this.props.page}/>;
    }
}

module.exports = MarkdownBlock;
