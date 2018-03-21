const React = require('react');
const cn = require('classnames');
const { getLink } = require('./utils');

class SideNav extends React.Component {
    getLink(baseUrl, path, id) {
        if (path.match(/^https?:/)) {
            return path;
        }
        return baseUrl + id + '.html';
    }
    renderPageLink(page, key) {
        const { menuName, name, path, id } = page;
        const { current, config } = this.props.page;
        const itemClasses = cn('navListItem', { navListItemActive: path === current.path });
        const linkClasses = cn('navItem', { navItemActive: path === current.path });

        return (
            <li className={itemClasses} key={key}>
                <a className={linkClasses} href={getLink(config.baseUrl, path, id)}>
                    {menuName || name}
                </a>
            </li>
        );
    }
    renderGroup(group, key) {
        const { name, pages } = group;
        return (
            <div className="navGroup navGroupActive" key={key}>
                <h3>{name}</h3>
                <ul>{pages.map(this.renderPageLink, this)}</ul>
            </div>
        );
    }
    render() {
        const { current, groups } = this.props.page;
        return (
            <nav className="toc">
                <div className="toggleNav">
                    <section className="navWrapper wrapper">
                        <div className="navBreadcrumb wrapper">
                            <div className="navToggle" id="navToggler">
                                <i />
                            </div>
                            <h2>
                                <i>›</i>
                                <span>{current.name}</span>
                            </h2>
                        </div>
                        <div className="navGroups">
                            {groups.map(this.renderGroup, this)}
                        </div>
                    </section>
                </div>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        $('#navToggler').click(function(){
                            $('#docsNav').toggleClass('docsSliderActive');
                        });
                        `,
                    }}
                    />
            </nav>
        );
    }
}
SideNav.defaultProps = {
    contents: [],
};
module.exports = SideNav;
