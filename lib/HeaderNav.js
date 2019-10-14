const React = require('react');
const { getLink } = require('./utils');

class SelectMenu extends React.Component {
    render() {
        const { menu, config, page } = this.props;
        const { menuId, current } = page;
        return (
            <div>
                <a id={`mdoc_menu_${menu.id}`} style={Object.assign(menuId===menu.id ? { color: config.colors.activeColor } : {}, {cursor: 'hand'})}>{menu.name}</a>
                <table className='mdoc_select_menu_table'>
                    <tbody>
                        {
                            menu.pages.map((o, k) => (
                                <tr key={k}>
                                {
                                    !o.blank &&
                                    <td>
                                        <a href={getLink(o.path, o.id)} key={k} target='_self' style={ current.id===o.id ? { color: config.colors.activeColor }: {} }>{o.name}</a>
                                    </td>
                                    ||
                                    <td dangerouslySetInnerHTML={{__html: `<a href="${getLink(o.path, o.id)}" target="_blank" onclick="$(event.target).parents('.mdoc_select_menu_table').hide()">${o.name}</a>`}} />
                                }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        $('#mdoc_menu_${menu.id}').click(function(){
                            var el = $('#mdoc_menu_${menu.id}').next();
                            var isHide = el.is(':hidden');
                            $('.mdoc_select_menu_table').hide();
                            if (isHide) {
                                var offset = ($(this).outerWidth()-100)/2;
                                $('.mdoc_select_menu_table').css('transform', 'translateX('+offset+'px)');
                                el.show();
                            } else {
                                el.hide();
                            }
                        });
                        `,
                    }}
                    />
            </div>
        );
    }
}


class HeaderNav extends React.Component {
    makeLinks(menu, key) {
        const { config, menuId } = this.props.page;
        const { mainPage, mainPageId, name, id } = menu;

        return (
            <li key={key}>
                {
                    mainPage &&
                    <a href={getLink(mainPage, mainPageId)} target={menu.blank ? '_blank' : '_self'} style={ menuId===id ? {color: config.colors.activeColor} : {} }>
                        {name}
                    </a>
                    ||
                    <SelectMenu menu={menu} config={config} page={this.props.page}/>
                }
            </li>
        );
    }
    renderResponsiveNav(menus) {
        return (
            <div className="navigationWrapper navigationSlider">
                <nav className="slidingNav">
                    <ul className="nav-site nav-site-internal">
                        {menus.map(this.makeLinks, this)}
                    </ul>
                </nav>
            </div>
        );
    }
    render() {
        const { config } = this.props.page;
        const { baseUrl, logo, title, menus } = config;
        return (
            <div className="fixedHeaderContainer">
                <div className="headerWrapper wrapper">
                    <header>
                        <a href={baseUrl}>
                            { logo && <img className="logo" src={logo} /> }
                            <span className="headerTitle">{title}</span>
                        </a>
                        {this.renderResponsiveNav(menus)}
                    </header>
                </div>
            </div>
        );
    }
}

module.exports = HeaderNav;
