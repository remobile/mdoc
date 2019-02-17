const React = require('react');
const Markdown = require('markdown-it');
const {md5} = require('./utils');

function getTOC(content, topLevel = 'h2', subLevel = 'h3') {
    let current;
    const list = [];
    const md = new Markdown();
    md.use((m) => {
        m.renderer.rules.heading_open = function(tokens, idx, options, env, slf) {
            const tag = tokens[idx].tag;
            const label = tokens[idx + 1].content;
            if (tag === topLevel) {
                current = { label, id: md5(label), children: [] };
                list.push(current);
            } else if (tag === subLevel) {
                current.children.push({ label, id: md5(label), children: [] });
            }
        };
    });
    md.render(content);
    return list;
}

const Headings = ({headings}) => {
    return (
        !!headings.length &&
        <ul className="toc-headings">
            {
                headings.map((heading, key) => (
                    <li key={key}>
                        <a href={`#${heading.id}`} dangerouslySetInnerHTML={{ __html: heading.label }} />
                        <Headings headings={heading.children} />
                    </li>
                ))
            }
        </ul>
    );
};

class OnPageNav extends React.Component {
    render() {
        const { page, content } = this.props;
        const headings = getTOC(content, 'h2', 'h3');
        return <Headings headings={headings} />;
    }
}

module.exports = OnPageNav;
