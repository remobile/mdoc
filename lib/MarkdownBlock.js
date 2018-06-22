const React = require('react');
const MarkdownView = require('./MarkdownView');
const CWD = process.cwd();

class MarkdownBlock extends React.Component {
    render() {
        return <MarkdownView source={this.props.children} page={this.props.page || { config: require(CWD + '/config.js') }}/>;
    }
}

module.exports = MarkdownBlock;
