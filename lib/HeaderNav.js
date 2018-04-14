const React = require('react');
const { getLink } = require('./utils');

class SelectMenu extends React.Component {
    render() {
        const { menu, config, page } = this.props;
        const { menuId, current } = page;
        return (
            <div>
                <a id={`modc_menu_${menu.id}`} style={Object.assign(menuId===menu.id ? { color: config.colors.activeColor } : {}, {cursor: 'hand'})}>{menu.name}</a>
                <table id={`modc_list_${menu.id}`} style={{display: 'normal', marginTop: 10, border: 0, display: 'none'}}>
                    <tbody>
                        {
                            menu.pages.map((o, k) => (
                                <tr key={k}>
                                    <td style={{backgroundColor: config.colors.primaryColor, borderTop: 'solid 1px gray'}}>
                                        <a href={getLink(o.path, o.id)} key={k} target='_self' style={ current.id===o.id ? { color: config.colors.activeColor }: {} }>{o.name}</a>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        $('#modc_menu_${menu.id}').click(function(){
                            $('#modc_menu_${menu.id}').next().fadeToggle();
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
                    <a href={getLink(mainPage, mainPageId)} target={menu.external ? '_blank' : '_self'} style={ menuId===id ? {color: config.colors.activeColor} : {} }>
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
                            {
                                logo &&
                                <img className="logo" src={config.baseUrl+logo} />
                            }
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
