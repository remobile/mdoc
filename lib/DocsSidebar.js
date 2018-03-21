const React = require('react');
const Container = require('./Container');
const SideNav = require('./SideNav');

class DocsSidebar extends React.Component {
    render() {
        const { page } = this.props;
        return (
            !!page.groups &&
            <Container className="docsNavContainer" id="docsNav" wrapper={false}>
                <SideNav page={page} />
            </Container>
        );
    }
}

module.exports = DocsSidebar;
