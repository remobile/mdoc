// 基本单元项必须为m=n的形式，中间不能有空格, 如果值需要空格，需要由\转义
// 如果是数字，默认为数字，添加了引号的为字符串，如果不是数字，默认不加引号表示字符串，添加了引号则引号为字符串的一部分
// 函数必须为o=>xxx 或 o=>{...} 或 (o,m)=>xxx 或(o,m)=>{...}的格式 (中间不能有空格)
// const str = `a=1 b=-3    c='1'    d='方运江'`;
// const str = `d1=false d2=true d3='true'`;
// const str = `f={fang a=1 f={fang a=1 }}`;
// const str = `d=a\\ b\\ c f=p g={a=1 b=-3 g={a=1 b=-3}}`;
// const str = `d=a\\ b\\ c f=/^g/`;
// const str = `d=a\\ b\\ c f=o=>o f1=o=>{return o+1} f2=(a,b)=>a+b f3=(a,b)=>{return a+b;}`;
// const str = 'm=[1 2\\ 5 3 [ 1 2 3 ] {fang=fang a=[1 2]}]';
// console.log(parseObject(str));

function parseObject(line) {
    const json = {};
    const list = [];
    let i = -1, max = line.length - 1, item = '', flag = 0;
    let amatch = 0, bmatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '\\') {
            flag = 1;
            continue;
        }
        if (ch === '{') {
            amatch++;
        } else if (ch === '}') {
            amatch--;
        } else if (ch === '[') {
            bmatch++;
        } else if (ch === ']') {
            bmatch--;
        }
        if (ch === ' ' && flag !== 1 && amatch === 0 && bmatch === 0) {
            item && list.push(item);
            item='';
        } else {
            item=`${item}${ch}`;
        }
        flag = 0;
    }
    if (amatch === 0 && bmatch === 0) { // 如果括号不匹配，则丢弃
        item && list.push(item);
    }

    list.forEach(o=>{
        const split = o.indexOf('=');
        let val, key;
        if (split === -1) {
            key = o;
        } else {
            key = o.substr(0, split);
            val = o.substr(split+1);
        }

        if (val === undefined) {
            val = true;
        } else if (val === 'true') {
            val = true;
        } else if (val === 'false') {
            val = false;
        } else if (/^-?\d+(\.\d+)?$/.test(val)) { //数字
            val = val*1;
        } else if (/^'(-?\d+(\.\d+)?)|true|false'$/.test(val)) {
            val = val.replace(/^'|'$/g, '');
        } else if (val[0] === '{') { // 子json
            val = parseObject(val.substring(1, val.length-1));
        } else if (val[0] === '[') { // 子jsonArray
            val = parseArray(val.substring(1, val.length-1));
        } else if (/^\/[^/]+\/$/.test(val)) { // 正则表达式
            val = new RegExp(val.substring(1, val.length-1));
        } else if (/=>/.test(val)) { // 函数
            val = `__function_start__${val}____function_end__`;
        }
        Object.assign(json, { [key]: val });
    });
    return json;
}

function parseArray(line) {
    const list = [];
    let i = -1, max = line.length - 1, item = '', flag = 0;
    let amatch = 0, bmatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '\\') {
            flag = 1;
            continue;
        }
        if (ch === '{') {
            amatch++;
        } else if (ch === '}') {
            amatch--;
        } else if (ch === '[') {
            bmatch++;
        } else if (ch === ']') {
            bmatch--;
        }
        if (ch === ' ' && flag !== 1 && amatch === 0 && bmatch === 0) {
            item && list.push(item);
            item='';
        } else {
            item=`${item}${ch}`;
        }
        flag = 0;
    }
    if (amatch === 0 && bmatch === 0) { // 如果括号不匹配，则丢弃
        item && list.push(item);
    }
    return list.map(val=>{
        if (val === 'true') {
            val = true;
        } else if (val === 'false') {
            val = false;
        } else if (/^-?\d+(\.\d+)?$/.test(val)) { //数字
            val = val*1;
        } else if (/^'(-?\d+(\.\d+)?)|true|false'$/.test(val)) {
            val = val.replace(/^'|'$/g, '');
        } else if (val[0] === '{') { // 子json
            val = parseObject(val.substring(1, val.length-1));
        } else if (val[0] === '[') { // 子jsonArray
            val = parseArray(val.substring(1, val.length-1));
        } else if (/^\/[^/]+\/$/.test(val)) { // 正则表达式
            val = new RegExp(val.substring(1, val.length-1));
        } else if (/=>/.test(val)) { // 函数
            val = `__function_start__${val}____function_end__`;
        }
        return val;
    });
}

module.exports = {
    getLink: (path, id) => {
        if (/^https?:/.test(path)) {
            return path;
        }
        return id + '.html';
    },
    support: (page, type) => {
        const { supports=[] } = page;
        return supports.indexOf(type) > -1;
    },
    parseParams: (content, initialValue={}) => {
        return Object.assign(initialValue, parseObject(content));
    },
    parseJSON: line => {
        return JSON.stringify(parseObject(line)).replace(/"__function_start__|____function_end__"/g, '');
    },
};
