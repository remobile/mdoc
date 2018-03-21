const React = require('react');
const HeaderNav = require('./HeaderNav');
const Head = require('./Head');
const Footer = require(process.cwd() + '/lib/Footer');

// Component used to provide same head, header, footer, other scripts to all pages
class Site extends React.Component {
    render() {
        const { page, children } = this.props;
        return (
            <html>
                <Head page={page} />
                <body className="sideNavVisible" >
                    <HeaderNav page={page}/>
                    <div className="navPusher">
                        {children}
                        <Footer config={page.config} />
                    </div>
                </body>
            </html>
        );
    }
}
module.exports = Site;
