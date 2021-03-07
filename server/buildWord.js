const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer-cn');
const sizeOf = require('image-size');
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
}  = require('./res/docx');
const CWD = process.cwd();
const script = fs.readFileSync(path.join(__dirname, 'res/highlight.min.js'));
const style = fs.readFileSync(path.join(__dirname, 'res/atom-one-dark.min.css'));
let config, browser;

async function createCodeImage(code) {
    const html = `
        <html>
        <head>
            <script>${script}</script>
            <style>${style}</style>
            <style>
            pre, code {
                white-space: pre-wrap;
            }
            .hljs ul {
                list-style: decimal;
                padding: 0px 70px !important;
                font-size: 28px;
            }
            .hljs ul li {
                list-style: decimal;
                border-left: 1px solid #ddd !important;
                padding: 3px!important;
                margin: 0 !important;
                word-break: break-all;
                word-wrap: break-word;
            }
            </style>
        </head>
        <body>
            <pre>
                <code class="lang-javascript">
                ${code}
                </code>
            </pre>
            <script >
            hljs.initHighlightingOnLoad();
            document.querySelectorAll('pre code').forEach(o=>{
                const list = o.innerHTML.split(/\\n/);
                o.innerHTML = '<ul><li>'+list.slice(1, list.length-1).join('\\n</li><li>')+'</li></ul>';
            });
            </script>
        </body>
        </html>
    `;

    !browser && (browser = await puppeteer.launch());
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport({ width: 1920, height: 960 });
    const element = await page.$('code');
    const image = await element.screenshot();
    return image;
}

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
    console.log('[createImage]', list[0]);
    let w, h;
    const tw = 600; // 总宽度
    if (list.length === 1) {
        w = tw;
        const size = sizeOf(path.join(dir, list[0].image));
        h = w * size.height / size.width;
    } else {
        w = tw / list.length;
        h = w * 4 / 3;
    }
    const width = { size: 100, type: WidthType.PERCENTAGE }; // 表格总宽度
    const border = { color: 'white', size: 1 };
    const borders = { top: border, bottom: border, left: border, right: border };
    const text = (str) => new Paragraph({ text: str, style: 'Caption' });
    const image = (img, w, h) => new Paragraph({ children: [Media.addImage(doc, fs.readFileSync(path.join(dir, img)), w, h)], alignment: AlignmentType.CENTER });
    const imageList = list.map(o=> new TableCell({ children: [image(o.image, w, h)], borders }));
    const textList = list.map(o=> new TableCell({ children: [text(o.text)], borders, margins: { top: 100 } }));
    const table = new Table({ width, rows: [new TableRow({ children: imageList }), new TableRow({ children: textList })] });
    children.push(table);
}
function createExcel(excelTextList, children) {
    console.log('[createExcel]', excelTextList[0]);
    const width = { size: 100, type: WidthType.PERCENTAGE }; // 表格总宽度
    const list = (line) => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(o=>o.trim().replace(/<br>/g, '\n'));
    const text = (str, alignment = AlignmentType.CENTER) => new Paragraph({ children: [new TextRun({ text: str, size: config.tableFontSize, font: { name: config.fontName } })], alignment });
    const row = (line, alignments = []) => list(line).map((o, i)=> new TableCell({ children: [text(o, alignments[i])] }));
    const header = new TableRow({ children: row(excelTextList[0]) });
    const alignments = list(excelTextList[1]).map(o=> /^:-+:$/.test(o) ? AlignmentType.CENTER : /-+:$/.test(o) ? AlignmentType.END : AlignmentType.START);
    const rows = excelTextList.slice(2).map(line=>new TableRow({ children: row(line, alignments) }));
    const table = new Table({ width, rows: [ header, ...rows ] });
    children.push(table);
}
async function createCode(doc, codeTextList, children) {
    console.log('[createCode]', codeTextList[0]);
    const buffer = await createCodeImage(codeTextList.join('\n'));
    const size = sizeOf(buffer);
    const image = Media.addImage(doc, buffer, 600, 600*size.height/size.width);
    children.push(new Paragraph(image));
}
async function crateWordLayer(doc, dir, children, level = -1) {
    const files = fs.readdirSync(dir);
    for (const index in files) {
        const file = files[index];
        const fullname = path.join(dir, file);
        const info = fs.statSync(fullname);
        if(info.isDirectory()) {
            await crateWordLayer(doc, fullname, children, level + 1);
        } else if (/.*\.md/.test(file)) {
            await parseMarkDownFile(doc, fullname, level, children);
        }
    }
}
async function parseMarkDownFile(doc, file, level, children) {
    const text = fs.readFileSync(file, 'utf8');
    const list = text.split(/\n/);
    let isExcel = false, isCode = false;
    let excelTextList = [];
    let codeTextList = [];
    for (const line of list) {
        if (/^\s*\|.*\|\s*$/.test(line)) { // 表格
            isExcel = true;
            excelTextList.push(line.trim());
        } else if (/^\s*```.*$/.test(line)) { // 代码
            if (!isCode) {
                isCode = true;
            } else {
                isCode = false;
                // 生成代码片段
                await createCode(doc, codeTextList, children);
                codeTextList = [];
            }
        } else {
            if (isExcel) {
                isExcel = false;
                // 生成表格
                createExcel(excelTextList, children);
                excelTextList = [];
            }
            if (isCode) { // 插入代码
                codeTextList.push(line);
            } else if (/^#+\s+/.test(line)) { // 标题
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
                createImage(doc, path.dirname(file), list, children);
            } else if (/^\*+\s+/.test(line)) { // 列表
                console.log('[createList]', line);
                const li = line.replace(/(^\*+)[^*]*/, '$1');
                const title = line.replace(/^\*+\s+/, '');
                const head = [ '', '■', '\t◆', '\t\t ●' ][li.length];
                children.push(new Paragraph({ children: [new TextRun({
                    text: `${head} ${title}`,
                    size: config.fontSize,
                    font: { name : config.fontName },
                })], indent: { left: 900, hanging: 360 } }));
            } else {
                children.push(new Paragraph({ children: [new TextRun({
                    text: line,
                    size: config.fontSize,
                    font: { name : config.fontName },
                })], indent: { left: 900, hanging: 360 } }));
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
async function buildMarkdown(configPath) {
    config = require(path.resolve(CWD, configPath));
    config.backgroundColor = config.backgroundColor || 'FFFFFF';
    config.fontName = config.fontName || 'Songti SC Regular';
    config.tableFontSize = config.tableFontSize || config.fontSize;

    const styles = config.stylesPath && fs.readFileSync(path.resolve(CWD, config.stylesPath), 'utf-8');
    const numbering = config.numberingPath && fs.readFileSync(path.resolve(CWD, config.numberingPath), 'utf-8');
    const doc = new Document({
        title: config.title || '点击这里修改标题',
        background: { color: config.backgroundColor },
        externalStyles: styles,
        externalNumbering: numbering,
    });
    const children = [];
    await crateWordLayer(doc, config.srcPath, children);
    doc.addSection({ children });
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(config.distPath || 'dist.docx', buffer);
    });
    browser && await browser.close();
}

module.exports = buildMarkdown;
