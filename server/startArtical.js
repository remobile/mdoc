const fs = require('fs-extra');
const path = require('path');
const sizeOf = require('image-size');
const jimp = require('jimp');
const _ = require('lodash');
const CWD = process.cwd();
let hasCode;

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
async function createImage(list, children, file, build) {
    console.log('[createImage]', list[0]);
    let w, h;
    const tw = 1000; // 总宽度
    const dir = path.dirname(file);
    if (list.length === 1) {
        w = tw;
        const size = sizeOf(path.join(dir, list[0].image));
        h = w * size.height / size.width;
    } else {
        w = tw / list.length;
        h = w * 4 / 3;
    }
    const images = [];
    for (const o of list) {
        let img;
        if (!build) {
            img = path.join(dir, o.image);
        } else {
            const image = await jimp.read(path.join(dir, o.image));
            if (image.getWidth() > w) {
                await image.resize(w, jimp.AUTO);
            } else if (image.getHeight() > h) {
                await image.resize(jimp.AUTO, h);
            }
            img = await image.getBase64Async(jimp.MIME_JPEG);
        }
        images.push({ img, text: o.text, w, h });
    }
    children.push({ images, file, w: tw, h });
}
function createExcel(excelTextList, children, file) {
    console.log('[createExcel]', excelTextList[0]);
    const tw = 1000; // 总宽度
    const list = (line) => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(o=>o.trim().replace(/<br>/g, '\n'));
    const text = (str, width, alignment = 'center') => ({ text: str, alignment, width });
    const row = (line, widths = [], alignments = []) => list(line).map((o, i)=> text(o, widths[i], alignments[i]));
    const alignments = list(excelTextList[1]).map(o=> /^:\s*\d+:\s*$/.test(o) ? 'center' : /\d+\s*:$/.test(o) ? 'right' : 'left');
    let widths = list(excelTextList[1]).map(o=>+(o.replace(/[:\s]*/g, ''))||1);
    const totalWidth = _.sum(widths);
    widths = widths.map(o=>Math.round(o/totalWidth*1000)-4);
    const header = row(excelTextList[0], widths);
    const rows = excelTextList.slice(2).map(line=>row(line, widths, alignments));
    children.push({ table: { header, rows }, file  });
}
function createCode(codeTextList, children, file) {
    console.log('[createCode]', codeTextList[0]);
    children.push({ code: codeTextList.join('\n'), file });
}

async function parseMarkDownFile(file, children, build) {
    const text = fs.readFileSync(file, 'utf8');
    const list = text.split(/\n/).filter(Boolean);
    let isExcel = false, isCode = false;
    let excelTextList = [];
    let codeTextList = [];
    let firstHeadLevel;
    hasCode = false;
    for (const line of list) {
        if (/^\s*\|.*\|\s*$/.test(line)) { // 表格
            isExcel = true;
            excelTextList.push(line.trim());
        } else if (/^\s*```.*$/.test(line)) { // 代码
            if (!isCode) {
                isCode = true;
                hasCode = true;
            } else {
                isCode = false;
                // 生成代码片段
                createCode(codeTextList, children, file);
                codeTextList = [];
            }
        } else {
            if (isExcel) {
                isExcel = false;
                // 生成表格
                createExcel(excelTextList, children, file);
                excelTextList = [];
            }
            if (isCode) { // 插入代码
                codeTextList.push(line);
            } else if (/^#+\s+/.test(line)) { // 标题
                const li = line.replace(/(^#+)[^#]*/, '$1');
                if (!firstHeadLevel) {
                    firstHeadLevel = li.length;
                }
                const no = li.length - firstHeadLevel;
                const title = line.replace(/^#+\s+/, '');
                console.log(`HEADING_${no}:${_.repeat('-', no*3)}${title}`);
                children.push({
                    file,
                    text: title,
                    headingNo: no,
                });
            } else if (/^\s*!\[([^\]]*)\]\(([^)]*)\)/.test(line)) { // 图片
                const list = parseImage(line, []);
                await createImage(list, children, file, build);
            } else if (/^\*+\s+/.test(line)) { // 列表
                console.log('[createList]', line);
                const li = line.replace(/(^\*+)[^*]*/, '$1');
                const title = line.replace(/^\*+\s+/, '');
                const head = [ '', '■', '&emsp;&emsp;◆', '&emsp;&emsp;&emsp;&emsp;●' ][li.length];
                children.push({
                    text: `${head} ${title}`,
                });
            } else {
                children.push({
                    file,
                    text: line,
                });
            }
        }
    }
    if (isExcel) {
        isExcel = false;
        // 生成表格
        createExcel(excelTextList, children, file);
        excelTextList = [];
    }
}
function getHtml(children, build) {
    const heading = [];
    let imgNo = 1;
    return children.map(o=>{
        if (o.headingNo !== undefined) {
            if (!o.headingNo) {
                return `<div class="title" >${o.text}</div>`;
            }
            const no = o.headingNo - 1;
            heading[no] = (heading[no] || 0) + 1;
            heading.length = no + 1;
            return `<h${o.headingNo}>${heading.filter(Boolean).join('.')} ${o.text}</h${o.headingNo}>`;
        } else if (o.images) {
            return `<div class="imageRow" style="width:${o.w}px;height:${o.h}px;">${o.images.map(m=>`<div class="imageItem"><img src="${m.img}" style="width:${m.w}px;height:${m.h}px;"/><div class="imageItem">图${imgNo++}：${m.text}</div></div>`).join('')}</div><br/>`;
        } else if (o.table) {
            return `<table><thead><tr>${o.table.header.map(m=>`<th style="text-align:${m.alignment};min-width:${m.width}px;max-width:${m.width}px">${m.text}</th>`).join('')}</tr></thead><tbody>${o.table.rows.map(m=>`<tr>${m.map(n=>`<td style="text-align:${n.alignment}">${n.text}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        } else if (o.code) {
            return `<pre><code class="lang-javascript">${o.code}</code></pre>`;
        } else {
            return `<p>&emsp;&emsp;${o.text}</p>`;
        }
    }).join('');
}
function getPageHtml(children) {
    return `
        <html>
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width" />
            ${!hasCode?'':`
            <script src="res/highlight.min.js">
            </script><link rel="stylesheet" href="res/atom-one-dark.min.css" />
            `}
            <style>
            body { background: black; display: flex; justify-content: center; padding: 0; margin: 0; }
            .title { font-size: 32px; text-align: center; padding-top: 20px; padding-bottom: 10px; }
            h1, h2, h3, h4, h5, h6 { color: inherit; font-weight: 600; line-height: 1.25; margin-bottom: 16px; margin-top: 1.5em; }
            h1 { font-size: 32px; } h2 { font-size: 24px; } h3 { font-size: 20px; } h4 { font-size: 16px; } h5 { font-size: 14px; } h6 { font-size: 13.6px; }
            pre, code { white-space: pre-wrap; }
            ${!hasCode?'':`
            .hljs ul { list-style: decimal; padding: 0px 70px !important; font-size: 28px; }
            .hljs ul li { list-style: decimal; border-left: 1px solid #ddd !important; padding: 3px!important; margin: 0 !important; word-break: break-all; word-wrap: break-word; }
            `}
            .container { min-width: 1000px; max-width: 1000px; min-height: 100%; background: #FFFFFF; padding-left: 20px; padding-right: 20px; }
            .imageRow { display: flex; flex-direction: row; }
            .imageItem { display: flex; flex-direction: column; align-items: center; }
            table { border-collapse: collapse; border-spacing: 0; display: block; margin-bottom: 16px; margin-top: 0; overflow: auto; width: 100%; }
            table tr { background-color: transparent; border-top: 1px solid #dfe2e5; }
            table th, table td { border: 1px solid #dfe2e5; }
            table th { background-color: #f6f8fa; color: inherit; font-weight: 600; }
            table td { color: inherit; }
            </style>
        </head>
        <body>
            <div class="container">
            ${getHtml(children)}
            </div>
            ${!hasCode?'':
            `
            <script >
            hljs.initHighlightingOnLoad();
            document.querySelectorAll('pre code').forEach(o=>{
                const list = o.innerHTML.split(/\\n/);
                o.innerHTML = '<ul><li>'+list.slice(1, list.length-1).join('\\n</li><li>')+'</li></ul>';
            });
            </script>
            `}
        </body>
        </html>
    `;
}
async function startArtical(file, port, verbose, open, build) {
    let children = [];
    await parseMarkDownFile(file, children, build);
    if (build) {
        return fs.writeFileSync(build===true ? '__dist.html' : build, getPageHtml(children), 'utf-8');
    }
    const express = require('express');
    const morgan = require('morgan');
    const app = express();
    verbose && app.use(morgan('short'));
    app.use(express.static('.'));
    app.use(express.static(__dirname));

    app.get('/', (req, res) => {
        res.send(getPageHtml(children));
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
                    match: [path.join(CWD, file)],
                    fn: async function (event, file) {
                        if (event === 'change') {
                            children = [];
                            await parseMarkDownFile(file, children);
                            browserSync.reload();
                        }
                    }
                }],
                notify: false,
                open,
            });
        });
        gulp.start(['browser']);
    });
    server.on('error', function (err) {
        console.log('open error on port:', port);
        startServer(configPath, port+1);
    });
}

module.exports = startArtical;
