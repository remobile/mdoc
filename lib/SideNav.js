const React = require('react');
const cn = require('classnames');
const { getLink } = require('./utils');

class SideNav extends React.Component {
    renderPageLink(page, key) {
        const { menuName, name, path, id, blank } = page;
        const { current, config } = this.props.page;
        const itemClasses = cn('navListItem', { navListItemActive: path === current.path });
        const linkClasses = cn('navItem', { navItemActive: path === current.path });

        return (
            <li className={itemClasses} key={key}>
                <a className={linkClasses} href={getLink(path, id)}>
                    {menuName || name}
                </a>
            </li>
        );
    }
    renderGroup(group, key) {
        const { config } = this.props.page;
        const { name, pages } = group;
        let ulClassName = '';
        let categoryClassName = 'navGroupCategoryTitle';
        let arrow;
        if (config.sideNavCollapsible) {
            categoryClassName += ' collapsible';
            ulClassName = 'hide';
            arrow = (
                <span className="arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#565656" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                    </svg>
                </span>
            );
        }

        return (
            <div className="navGroup" key={key}>
                <h3 className={categoryClassName}>
                    {name}
                    {arrow}
                </h3>
                <ul className={ulClassName}>{pages.map(this.renderPageLink, this)}</ul>
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
                        var coll = document.getElementsByClassName('collapsible');
                        var checkActiveCategory = true;
                        for (var i = 0; i < coll.length; i++) {
                            var links = coll[i].nextElementSibling.getElementsByTagName('*');
                            if (checkActiveCategory){
                                for (var j = 0; j < links.length; j++) {
                                    if (links[j].classList.contains('navListItemActive')){
                                        coll[i].nextElementSibling.classList.toggle('hide');
                                        coll[i].childNodes[1].classList.toggle('rotate');
                                        checkActiveCategory = false;
                                        break;
                                    }
                                }
                            }

                            coll[i].addEventListener('click', function() {
                                var arrow = this.childNodes[1];
                                arrow.classList.toggle('rotate');
                                var content = this.nextElementSibling;
                                content.classList.toggle('hide');
                            });
                        }

                        document.addEventListener('DOMContentLoaded', function() {
                            createToggler('#navToggler', '#docsNav', 'docsSliderActive');
                            createToggler('#tocToggler', 'body', 'tocActive');

                            const headings = document.querySelector('.toc-headings');
                            headings && headings.addEventListener('click', function(event) {
                                if (event.target.tagName === 'A') {
                                    document.body.classList.remove('tocActive');
                                }
                            }, false);

                            function createToggler(togglerSelector, targetSelector, className) {
                                var toggler = document.querySelector(togglerSelector);
                                var target = document.querySelector(targetSelector);

                                if (!toggler) {
                                    return;
                                }

                                toggler.onclick = function(event) {
                                    event.preventDefault();
                                    target.classList.toggle(className);
                                };
                            }
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
