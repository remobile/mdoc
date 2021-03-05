const fs = require('fs-extra');
const path = require('path');
const sizeOf = require('image-size');
const _ = require('lodash');
const CWD = process.cwd();
let config, browser;

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
function createImage(dir, list, children, file) {
    console.log("[createImage]", list[0]);
    let w, h;
    const tw = 1000; // 总宽度
    if (list.length === 1) {
        w = tw;
        const size = sizeOf(path.join(dir, list[0].image));
        h = w * size.height / size.width;
    } else {
        w = tw / list.length;
        h = w * 4 / 3;
    }
    const images = list.map(o=>({ img: path.join(dir, o.image), text: o.text, w, h }));
    children.push({ images, file, w: tw, h });
}
function createExcel(excelTextList, children) {
    // console.log("[createExcel]", excelTextList[0]);
    // const fontSize = config.tableFontSize; // 字体大小
    // const width = { size: 100, type: WidthType.PERCENTAGE }; // 表格总宽度
    // const list = (line) => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(o=>o.trim().replace(/<br>/g, '\n'));
    // const text = (str, alignment = AlignmentType.CENTER) => paragraph({ children: [new TextRun({ text: str, size: fontSize, font: { name: config.fontName } })], alignment });
    // const row = (line, alignments = []) => list(line).map((o, i)=> new TableCell({ children: [text(o, alignments[i])] }));
    // const header = new TableRow({ children: row(excelTextList[0]) });
    // const alignments = list(excelTextList[1]).map(o=> /^:-+:$/.test(o) ? AlignmentType.CENTER : /-+:$/.test(o) ? AlignmentType.END : AlignmentType.START);
    // const rows = excelTextList.slice(2).map(line=>new TableRow({ children: row(line, alignments) }));
    // const table = new Table({ width, rows: [ header, ...rows ] });
    // children.push(table);
}
function createCode(codeTextList, children) {
    // console.log("[createCode]", codeTextList[0]);
    // children.push(paragraph(codeTextList.join('\n')));
}
function crateWordLayer(dir, children, level = -1) {
    const files = fs.readdirSync(dir);
    for (const index in files) {
        const file = files[index];
        const fullname = path.join(dir, file);
        const info = fs.statSync(fullname);
        if(info.isDirectory()) {
            crateWordLayer(fullname, children, level + 1);
        } else if (/.*\.md/.test(file)) {
            const text = fs.readFileSync(fullname, 'utf8');
            const list = text.split(/\n/).filter(Boolean);
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
                        createCode(codeTextList, children);
                        codeTextList = [];
                    }
                } else {
                    if (isCode) { // 插入代码
                        codeTextList.push(line);
                    } else if (/^#+\s+/.test(line)) { // 标题
                        const li = line.replace(/(^#+)[^#]*/, '$1');
                        const no = li.length + Math.max(level, 0);
                        const title = line.replace(/^#+\s+/, '');
                        console.log(`HEADING_${no}:${_.repeat('-', no*3)}${title}`);
                        children.push({
                            file,
                            text: title,
                            headingNo: no,
                        });
                    } else if (/^\s*!\[([^\]]*)\]\(([^)]*)\)/.test(line)) { // 图片
                        const list = parseImage(line, []);
                        createImage(dir, list, children, file);
                    // } else if (/^\*+\s+/.test(line)) { // 列表
                    //     const li = line.replace(/(^\*+)[^*]*/, '$1');
                    //     const level = li.length;
                    //     const title = line.replace(/^\*+\s+/, '');
                    //     const head = [ '', '■', '\t◆', '\t\t ●' ][level];
                    //     children.push(paragraph({ children: [new TextRun({
                    //         text: `${head} ${title}`,
                    //         size: config.paragraphFontSize,
                    //         font: { name : config.fontName },
                    //     })], indent: { left: 900, hanging: 360 } }));
                    } else {
                        children.push({
                            file,
                            text: line,
                            fontSize: config.paragraphFontSize,
                            fontName: config.fontName,
                        });
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
    }
}
function getHtml(children) {
    const heading = [];
    let imgNo = 1;
    return children.map(o=>{
        if (o.headingNo) {
            const no = o.headingNo - 1;
            heading[no] = (heading[no] || 0) + 1;
            heading.length = no + 1;
            return `<h${o.headingNo}>${heading.join('.')} ${o.text}</h${o.headingNo}>`;
        } else if (o.images) {
            return `<div class="imageRow" style="width:${o.w}px;height:${o.h}px;">${o.images.map(m=>`<div class="imageItem"><img src="${m.img}" style="width:${m.w}px;height:${m.h}px;"/><div class="imageItem">图${imgNo++}：${m.text}</div></div>`)}</div><br/>`;
        } else {
            return `<p>&emsp;&emsp;${o.text}</p>`;
        }
    }).join('<br/>');
}
async function startWord(configPath, port, verbose, open) {
    config = require(path.resolve(CWD, configPath));
    let children = [];

    const express = require('express');
    const morgan = require('morgan');
    const app = express();
    verbose && app.use(morgan('short'));
    app.use(express.static('.'));

    app.get('/', (req, res) => {
        children = [];
        crateWordLayer(config.srcPath, children);
        res.send(`
            <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width" />
                <style>
                h1, h2, h3, h4, h5, h6 { color: inherit; font-weight: 600; line-height: 1.25; margin-bottom: 16px; margin-top: 1.5em; }
                h1 { font-size: 32px; }
                h2 { font-size: 24px; }
                h3 { font-size: 20px; }
                h4 { font-size: 16px; }
                h5 { font-size: 14px; }
                h6 { font-size: 13.6px; }
                .imageRow { display: flex; flex-direction: row; }
                .imageItem { display: flex; flex-direction: column; align-items: center; }
                </style>
            </head>
            <body>
                ${getHtml(children)}
            </body>
            </html>
            `);
    });

    const server = app.listen(port);
    server.on('listening', function () {
        const url = 'http://localhost:' + port;
        console.log('Open', url);
        const gulp = require('gulp');
        const browserSync = require('browser-sync').create();
        gulp.task('browser', function() {
            browserSync.init({
                proxy: url,
                files: [{
                    match: [path.join(CWD, config.srcPath)+'/**/*.md'],
                    fn: function (event, file) {
                        console.log("=======",event, file);
                    }
                }],
                notify: false,
                open,
            });
        });
        gulp.start(['browser']);
    });
    server.on('error', function (err) {
        console.log("open error on port:", port);
        startServer(configPath, port+1);
    });
}

module.exports = startWord;
