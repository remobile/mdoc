const React = require('react');
const HeaderNav = require('./HeaderNav');
const Head = require('./Head');
const cn = require('classnames');

// Component used to provide same head, header, footer, other scripts to all pages
class Site extends React.Component {
    render() {
        const { page, children } = this.props;
        const { current, config } = page;
        const Footer = config.footer ? require(process.cwd() + '/' + config.footer) : null;
        const hasToc = !!current.tocList;

        return (
            <html>
                <Head page={page} />
                <body className={cn("sideNavVisible", {separateOnPageNav: hasToc})} >
                    <HeaderNav page={page}/>
                    <div className="navPusher">
                        {children}
                        { config.footer && <Footer config={config} /> }
                    </div>
                </body>
            </html>
        );
    }
}
module.exports = Site;
