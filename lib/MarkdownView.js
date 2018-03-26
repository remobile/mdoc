'use strict';

const React = require('react');
const hljs = require('highlight.js');
const Markdown = require('markdown-it');
const markdownPlugins = require('../markdown-it-plugins');
const CWD = process.cwd();

class MarkdownView extends React.Component {
    content() {
        if (this.props.source) {
            return <span dangerouslySetInnerHTML={{ __html: this.renderMarkdown(this.props.source) }} />;
        } else {
            return React.Children.map(this.props.children, child => {
                if (typeof child === 'string') {
                    return <span dangerouslySetInnerHTML={{ __html: this.renderMarkdown(child) }} />;
                } else {
                    return child;
                }
            });
        }
    }
    renderMarkdown(source) {
        if (!this.md) {
            const config = require(CWD + '/config.js');

            this.md = new Markdown({
                breaks: true,
                // Highlight.js expects hljs css classes on the code element.
                // This results in <pre><code class="hljs css javascript">
                langPrefix: 'hljs css ',
                highlight: function(str, lang) {
                    lang =
                    lang || (config.highlight && config.highlight.defaultLang);
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(lang, str).value;
                        } catch (err) {}
                    }

                    try {
                        return hljs.highlightAuto(str).value;
                    } catch (err) {}

                    return '';
                },
                html: true,
                linkify: true,
            });

            // Register markdown plugins
            markdownPlugins.forEach(function(plugin) {
                plugin(this.md);
            }, this);

            // Register custom markdown plugins
            if (config.markdownPlugins) {
                config.markdownPlugins.forEach(function(plugin) {
                    plugin(this.md);
                }, this);
            }
        }
        const html = this.md.render(source);

        // Ensure fenced code blocks use Highlight.js hljs class
        return html.replace(/<pre><code>/g, '<pre><code class="hljs">');
    }
    render() {
        const Container = this.props.container;
        return (
            <Container>
                {this.content()}
            </Container>
        );
    }
}

MarkdownView.defaultProps = {
    container: 'div',
};

module.exports = MarkdownView;
