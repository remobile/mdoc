const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    Table,
    TableCell,
    TableRow,
    WidthType,
    Media,
}  = require( "docx");
const CWD = process.cwd();

function parseImage(line, list = []) {
    const match = line.match(/\s*!\[([^\]]*)\]\(([^)]*)\)\s*/);
    if (match) {
        const text = match[1];
        const image = match[2];
        list.push({ text, image });
        line = line.replace(/\s*!\[([^\]]*)\]\(([^)]*)\)\s*/, '');
        if (line) {
            return parseImage(line, list);
        }
    }
    return list;
}
function createImage(doc, dir, list, children) {
    let w, h;
    const fontSize = config.imageTextFontSize; // 字体大小
    const tw = 600; // 总宽度
    if (list.length === 1) {
        w = tw;
        h = w * 3 / 5;
    } else {
        w = tw / list.length;
        h = w * 4 / 3;
    }
    const width = { size: 100, type: WidthType.PERCENTAGE }; // 表格总宽度
    const border = { color: "white", size: 1 };
    const borders = { top: border, bottom: border, left: border, right: border };
    const text = (str) => new Paragraph({ children: [new TextRun({ text: str, size: fontSize, font: { name: config.fontName } })], alignment: AlignmentType.CENTER });
    const image = (img, w, h) => new Paragraph({ children: [Media.addImage(doc, fs.readFileSync(path.join(dir, img)), w, h)], alignment: AlignmentType.CENTER });
    const imageList = list.map(o=> new TableCell({ children: [image(o.image, w, h)], borders }));
    const textList = list.map(o=> new TableCell({ children: [text(o.text)], borders, margins: { top: 100 } }));
    const table = new Table({ width, rows: [new TableRow({ children: imageList }), new TableRow({ children: textList })] });
    children.push(table);
}
function createExcel(excelTextList, children) {
    const fontSize = config.tableFontSize; // 字体大小
    const width = { size: 100, type: WidthType.PERCENTAGE }; // 表格总宽度
    const list = (line) => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(o=>o.trim().replace(/<br>/g, '\n'));
    const text = (str, alignment = AlignmentType.CENTER) => new Paragraph({ children: [new TextRun({ text: str, size: fontSize, font: { name: config.fontName } })], alignment });
    const row = (line, alignments = []) => list(line).map((o, i)=> new TableCell({ children: [text(o, alignments[i])] }));
    const header = new TableRow({ children: row(excelTextList[0]) });
    const alignments = list(excelTextList[1]).map(o=> /^:-+:$/.test(o) ? AlignmentType.CENTER : /-+:$/.test(o) ? AlignmentType.END : AlignmentType.START);
    const rows = excelTextList.slice(2).map(line=>new TableRow({ children: row(line, alignments) }));
    const table = new Table({ width, rows: [ header, ...rows ] });
    children.push(table);
}
function crateWordLayer(doc, dir, children, level = -1) {
    fs.readdirSync(dir).forEach((file, index) => {
        const fullname = path.join(dir, file);
        const info = fs.statSync(fullname);
        if(info.isDirectory()) {
            crateWordLayer(doc, fullname, children, level + 1);
        } else if (/.*\.md/.test(file)) {
            const text = fs.readFileSync(fullname, 'utf8');
            const list = text.split(/\n/);
            let isExcel = false;
            let excelTextList = [];
            for (const line of list) {
                if (/^\s*\|.*\|\s*$/.test(line)) { // 表格
                    isExcel = true;
                    excelTextList.push(line.trim());
                } else {
                    if (/^#+\s+/.test(line)) { // 标题
                        const li = line.replace(/(^#+)[^#]*/, '$1');
                        const no = li.length + Math.max(level, 0);
                        const title = line.replace(/^#+\s+/, '');
                        console.log(`HEADING_${no}:${_.repeat('-', no*3)}${title}`);
                        children.push(new Paragraph({
                            text: title,
                            heading: HeadingLevel[`HEADING_${no}`],
                        }));
                    } else if (/^\s*!\[([^\]]*)\]\(([^)]*)\)/.test(line)) { // 图片
                        const list = parseImage(line, []);
                        createImage(doc, dir, list, children);
                    } else if (/^\*+\s+/.test(line)) { // 列表
                        const li = line.replace(/(^\*+)[^*]*/, '$1');
                        const level = li.length;
                        const title = line.replace(/^\*+\s+/, '');
                        const head = [ '', '■', '\t◆', '\t\t ●' ][level];
                        children.push(new Paragraph({ children: [new TextRun({
                            text: `${head} ${title}`,
                            size: config.paragraphFontSize,
                            font: { name : config.fontName },
                        })], indent: { left: 900, hanging: 360 } }));
                    } else {
                        children.push(new Paragraph({ children: [new TextRun({
                            text: line,
                            size: config.paragraphFontSize,
                            font: { name : config.fontName },
                        })], indent: { left: 900, hanging: 360 } }));
                    }
                    if (isExcel) {
                        isExcel = false;
                        // 生成表格
                        createExcel(excelTextList, children);
                        excelTextList = [];
                    }
                }
            }
            if (isExcel) {
                isExcel = false;
                // 生成表格
                createExcel(excelTextList, children);
                excelTextList = [];
            }
        }
    });
}
function buildMarkdown(configPath) {
    const config = require(path.resolve(CWD, configPath));

    const styles = config.stylesPath && fs.readFileSync(path.resolve(CWD, config.stylesPath), "utf-8");
    const numbering = config.numberingPathPath && fs.readFileSync(path.resolve(CWD, config.numberingPathPath), "utf-8");
    const doc = new Document({
        title: config.title || "点击这里修改标题",
        background: { color: config.backgroundColor || "FFFFFF" },
        externalStyles: styles,
        externalNumbering: numbering,
    });
    const children = [];
    crateWordLayer(doc, config.srcPath, children);
    doc.addSection({ children });
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(config.distPath || "dist.docx", buffer);
    });
}

module.exports = buildMarkdown;
