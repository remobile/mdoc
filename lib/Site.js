const React = require('react');
const HeaderNav = require('./HeaderNav');
const Head = require('./Head');

// Component used to provide same head, header, footer, other scripts to all pages
class Site extends React.Component {
    render() {
        const { page, children } = this.props;
        const Footer = page.config.footer ? require(process.cwd() + '/' + page.config.footer) : null;
        return (
            <html>
                <Head page={page} />
                <body className="sideNavVisible" >
                    <HeaderNav page={page}/>
                    <div className="navPusher">
                        {children}
                        {
                            page.config.footer &&
                            <Footer config={page.config} />
                        }
                    </div>
                </body>
            </html>
        );
    }
}
module.exports = Site;
