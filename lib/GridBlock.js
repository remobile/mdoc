const React = require('react');
const cn = require('classnames');

const MarkdownBlock = require('./MarkdownBlock');

class GridBlock extends React.Component {
    renderBlock(block) {
        const blockClasses = cn('blockElement', this.props.className, {
            alignCenter: this.props.align === 'center',
            alignRight: this.props.align === 'right',
            fourByGridBlock: this.props.layout === 'fourColumn',
            imageAlignBottom: block.image && block.imageAlign === 'bottom',
            imageAlignSide:
            block.image &&
            (block.imageAlign === 'left' || block.imageAlign === 'right'),
            imageAlignTop: block.image && block.imageAlign === 'top',
            threeByGridBlock: this.props.layout === 'threeColumn',
            twoByGridBlock: this.props.layout === 'twoColumn',
        });

        const topLeftImage =
        (block.imageAlign === 'top' || block.imageAlign === 'left') &&
        this.renderBlockImage(block.image, block.imageLink);

        const bottomRightImage =
        (block.imageAlign === 'bottom' || block.imageAlign === 'right') &&
        this.renderBlockImage(block.image, block.imageLink);

        return (
            <div className={blockClasses} key={block.title}>
                {topLeftImage}
                <div className="blockContent">
                    {this.renderBlockTitle(block.title)}
                    <MarkdownBlock>{block.content}</MarkdownBlock>
                </div>
                {bottomRightImage}
            </div>
        );
    }
    renderBlockImage(image, imageLink) {
        if (image) {
            if (imageLink) {
                return (
                    <div className="blockImage">
                        <a href={imageLink}>
                            <img src={image} />
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="blockImage">
                        <img src={image} />
                    </div>
                );
            }
        } else {
            return null;
        }
    }
    renderBlockTitle(title) {
        if (title) {
            return (
                <h2>
                    <MarkdownBlock>{title}</MarkdownBlock>
                </h2>
            );
        } else {
            return null;
        }
    }
    render() {
        return (
            <div className="gridBlock">
                {this.props.contents.map(this.renderBlock, this)}
            </div>
        );
    }
}

GridBlock.defaultProps = {
    align: 'left',
    contents: [],
    imagealign: 'top',
    layout: 'twoColumn',
};

module.exports = GridBlock;
