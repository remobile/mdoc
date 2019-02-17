const React = require('react');
const Container = require('./Container');
const Doc = require('./Doc');
const DocsSidebar = require('./DocsSidebar');
const OnPageNav = require('./OnPageNav.js');
const Site = require('./Site');
const { getLink } = require('./utils');
const Markdown = require('markdown-it');

// component used to generate whole webpage for docs, including sidebar/header/footer
class DocsLayout extends React.Component {
    render() {
        const { page, children } = this.props;
        const { pre, current, next, config } = page;
        const hasToc = !!current.tocList;

        return (
            <Site page={page}>
                <div className="docMainWrapper wrapper">
                    <DocsSidebar page={page} />
                    <Container className="mainContainer">
                        <Doc page={page} content={children} />
                        <div className="docs-prevnext">
                            {
                                pre &&
                                <a className="docs-prev button" href={getLink(pre.path, pre.id)}> ←{' '} {pre.name || '后退'} </a>
                            }
                            {
                                next &&
                                <a className="docs-next button" href={getLink(next.path, next.id)}> {next.name || '前进'}{' '} → </a>
                            }
                        </div>
                    </Container>
                    {
                        hasToc &&
                        <nav className="onPageNav">
                            <OnPageNav page={page} content={children} />
                        </nav>
                    }
                </div>
            </Site>
        );
    }
}

module.exports = DocsLayout;
