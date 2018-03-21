const React = require('react');

class ErrorPage extends React.Component {
    render() {
        const { children } = this.props;
        return (
            <div className="error">
                { children }
            </div>
        );
    }
}

module.exports = ErrorPage;
