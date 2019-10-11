const React = require('react');
const MarkdownBlock = require('./MarkdownBlock');
const { support } = require('./utils');

class Doc extends React.Component {
    renderDirFiles(page, content = []) {
        return (
            <div id='mdoc_photo_container'>
                {
                    content.map((o, k)=>{
                        const {name, extname, url, origin} = o;
                        const isImage = ['.png', '.jpg', '.gif', 'jpeg'].indexOf(extname) !== -1;
                        return (
                            <div key={k} className='photoItemContainer'>
                                {
                                    isImage &&
                                    <img src={url} className='photoItem'/>
                                    ||
                                    <a href={url} className='photoItem'>{name+extname}</a>
                                }
                                {
                                    (isImage && origin) &&
                                    <a href={origin} target='_blank' className='photoName'>{name}</a>
                                    ||
                                    <span className='photoName'>{name}</span>
                                }
                            </div>
                        )
                    })
                }
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        $(document).ready(function(){
                            var viewer = new Viewer(document.getElementById("mdoc_photo_container"), {
                                backdrop: 'static',
                                toolbar: {
                                    prev: 1,
                                    zoomOut: 1,
                                    oneToOne: 1,
                                    flipHorizontal: 14,
                                    rotateLeft: 1,
                                    play: 1,
                                    rotateRight: 1,
                                    flipVertical: 1,
                                    reset: 1,
                                    zoomIn: 1,
                                    next: 1,
                                },
                            })})
                            `,
                        }
                    }
                    />
            </div>
        );
    }
    renderWithContainer(page, content) {
        const { container } = page.current;
        const element = typeof content === 'object' && content || <MarkdownBlock page={page}>{content}</MarkdownBlock>;
        if (container) {
            return React.createElement(container.dom || 'div', container.props, element);
        }
        return element;
    }
    render() {
        const { page, content } = this.props;
        const hasDir = support(page.current, 'dir');
        return (
            <div className='post'>
                <article style={{overflow: 'visible'}}>
                    { hasDir && this.renderDirFiles(page, content) || this.renderWithContainer(page, content) }
                </article>
            </div>
        );
    }
}

module.exports = Doc;
