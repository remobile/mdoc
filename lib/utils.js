const crypto = require('crypto');
const _ = require('lodash');
/*
* 简化JSON
* 规则：
* 1、基本单元项必须为m=n的形式，中间不能有空格, 如果值需要空格，需要由\转义
* 2、如果是数字，默认为数字，添加了引号的为字符串，如果不是数字，默认不加引号表示字符串，添加了引号则引号为字符串的一部分
* 3、函数必须为o=>xxx 或 o=>{...} 或 (o,m)=>xxx 或(o,m)=>{...}的格式 (中间不能有空格)
* 4、子Object为x={}的形式，子Array为x=[]的形式，所有分隔符都是空格
*/

// 示例：
// const str = `a=1 b=-3    c='1'    d='方运江'`;
// -> { a: 1, b: -3, c: '1', d: '\'方运江\'' }
// const str = `d1=false d2=true d3='true' d4 !d5`;
// -> { d1: false, d2: true, d3: 'true', d4: true, d5: false }
// const str = `m=[1 2 3]`;
// -> { m: [ 1, 2, 3 ] }
// const str = `f={fang a=1 f={fang a=1 }}`;
// -> { f: { fang: true, a: 1, f: { fang: true, a: 1 } } }
// const str = `d=a\\ b\\ c f=p g={a=1 b=-3 g={a=1 b=-3}}`;
// -> { d: 'a b c', f: 'p', g: { a: 1, b: -3, g: { a: 1, b: -3 } } }
// const str = `d=a\\ b\\ c f=/^g/`;
// -> { d: 'a b c', f: /^g/ }
// const str = `d=a\\ b\\ c f=o=>o f1=o=>{return o+1} f2=(a,b)=>a+b f3=(a,b)=>{return a+b;}`;
// -> { d: 'a b c',
//      f: '__function_start__o=>o____function_end__',
//      f1: '__function_start__o=>{return o+1}____function_end__',
//      f2: '__function_start__(a,b)=>a+b____function_end__',
//      f3: '__function_start__(a,b)=>{return a+b;}____function_end__' }
// const str = 'm=[1 2\\ 5 3 [ 1 2 3 ] {fang=fang a=[1 2]}]';
// -> { m: [ 1, '2 5', 3, [ 1, 2, 3 ], { fang: 'fang', a: [1, 2] } ] }
// const str = `m=[1 2 {m=1 n=2} {m=[1,2]}]`;
// -> { m: [ 1, 2, { m: 1, n: 2 }, { m: [Array] } ] }
// console.log(parseObject(str));

function parseObject(line) {
    line = line.replace(/\s*=\s*/g, '=').replace(/\s*=>\s*/g, '=>');
    const json = {};
    const list = [];
    let i = -1, max = line.length - 1, item = '', flag = 0;
    let amatch = 0, bmatch = 0, cmatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '\\') {
            flag = 1;
            if (amatch || bmatch) {
                item=`${item}${ch}`;
            }
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
        } else if (ch === '(') {
            cmatch++;
        } else if (ch === ')') {
            cmatch--;
        }
        if (ch === ' ' && flag !== 1 && amatch === 0 && bmatch === 0 && cmatch === 0) {
            item && list.push(item);
            item='';
        } else {
            item=`${item}${ch}`;
        }
        flag = 0;
    }
    if (amatch === 0 && bmatch === 0 && cmatch === 0) { // 如果括号不匹配，则丢弃
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
            if (key[0] === '!') {
                key = key.slice(1);
                val = false;
            } else {
                val = true;
            }
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
    line = line.replace(/\s*=\s*/g, '=').replace(/\s*=>\s*/g, '=>');
    const list = [];
    let i = -1, max = line.length - 1, item = '', flag = 0;
    let amatch = 0, bmatch = 0, cmatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '\\') {
            flag = 1;
            if (amatch || bmatch) {
                item=`${item}${ch}`;
            }
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
        } else if (ch === '(') {
            cmatch++;
        } else if (ch === ')') {
            cmatch--;
        }
        if (ch === ' ' && flag !== 1 && amatch === 0 && bmatch === 0 && cmatch === 0) {
            item && list.push(item);
            item='';
        } else {
            item=`${item}${ch}`;
        }
        flag = 0;
    }
    if (amatch === 0 && bmatch === 0 && cmatch === 0) { // 如果括号不匹配，则丢弃
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
// const str = { m: [ 1, 2, { m: 1, n: 2 }, { m: [Array] } ] }
// ->  `m=[1 2 {m=1 n=2} {m=[1,2]}]`;
// 这个函数是 parseObject 的逆向
function formatObject(value, child) {
    if (typeof(value) === 'string') {
        if (/^__function_start__.*__function_end__$/.test(value)) {
            return value.replace(/__function_start__|____function_end__/g, '');
        }
        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return `'${value}'`;
        }
        if (/ /.test(value)) {
            return value.replace(/ /g, '\\\\ ');
        }
        if (value === 'true') {
            return `'${value}'`;
        }
        if (value === 'false') {
            return `'${value}'`;
        }
    }
    if (typeof(value) !== 'object') {
        return value;
    }
    if (value instanceof RegExp) {
        return value;
    }
    if (value instanceof Array) {
        return `[${value.map(o=>formatObject(o, 1)).join(' ')}]`;
    }
    const str = `${_.map(value, (o,k)=>`${k}=${formatObject(o, 1)}`).join(' ')}`;
    return child ? `{${str}}` : str;
}

/*
* 解析简化子集合
从
公司董事会:[总经理:[
    副总经理1:[数据中心,测量中心],
    副总经理2:[技术部,办公室],
    副总经理3:[项目部,评估一部],
    技术总监:[技术部,评估二部],
]]
转化到:
[{
    text: "公司董事会",
    children: [{
        text: "总经理",
        children: [{
            text: "副总经理1",
            children: [{text: "数据中心"},{text: "测量中心"}],
        }, {
            text: "副总经理2",
            children: [{text: "财务部"},{text: "办公室"}],
        }, {
            text: "副总经理3",
            children: [{text: "项目部"},{text: "评估一部"}],
        }, {
            text: "技术总监",
            children: [{text: "技术部"},{text: "评估二部"}],
        }],
    }],
}]
*/
function parseSimpleArray(line) {
    const list = [];
    let i = -1, max = line.length - 1, item = '';
    let amatch = 0;
    while (i++ < max) {
        const ch = line[i];
        if (ch === '[') {
            amatch++;
        } else if (ch === ']') {
            amatch--;
        }
        if (ch === ',' && amatch === 0) {
            item && list.push(item.replace(/\]\s*$/, ']'));
            item='';
        } else {
            item=`${item}${ch}`;
        }
    }
    if (amatch === 0) {
        item && list.push(item.replace(/\]\s*$/, ']'));
    }
    return list.map(o=>parseSimpleObject(o)).filter(o=>o);
}
function parseSimpleObject(line) {
    if (!line) {
        return null;
    }
    let i = -1, max = line.length - 1, item = '';
    while (i++ < max) {
        const ch = line[i];
        if (ch === '[') {
            return {
                text: item,
                children: parseSimpleArray(line.substring(i+1, max)),
            };
        }
        item=`${item}${ch}`;
    }
    return { text: item };
}

// 这个函数是 JSON.stringify 的重写，目的是 key 值不要引号
function formatStandardObject(value, pad = 4, level = 0) {
    if (typeof(value) === 'string') {
        return `'${value}'`;
    }
    if (typeof(value) !== 'object') {
        return `${value}`;
    }
    if (value instanceof RegExp) {
        return `${value}`;
    }
    if (value instanceof Array) {
        return `[ ${value.map(o=>formatStandardObject(o, pad, level)).join(', ')} ]`;
    }
    const list = _.map(value, (o,k)=>`${_.repeat(' ', pad*(level+1))}${k}: ${formatStandardObject(o, pad, level+1)},`);
    list.unshift('{');
    list.push(`${_.repeat(' ', pad*level)}}`);
    return list.join('\n');
}
// remove a module and child modules from require cache, so server does not have
// to be restarted
function removeModulePathFromCache(moduleName) {
    Object.keys(module.constructor._pathCache).forEach(cacheKey => {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
}
function removeModuleAndChildrenFromCache(moduleName) {
    let mod = require.resolve(moduleName);
    if (mod && (mod = require.cache[mod])) {
        mod.children.forEach(child => {
            delete require.cache[child.id];
            removeModulePathFromCache(mod.id);
        });
        delete require.cache[mod.id];
        removeModulePathFromCache(mod.id);
    }
}
//rgba(31,147,255,0.73)
//rgb(31,147,255)
function rgbaToHex(rgba) {
    var list = rgba.replace(/\s*/g, '').match(/rgba?\((\d+),(\d+),(\d+),?(.*)?\)/);
    if (list) {
        return `#${(+list[1]).toString(16).padStart(2, '0')}${(+list[2]).toString(16).padStart(2, '0')}${(+list[3]).toString(16).padStart(2, '0')}${((list[4]||1)*100).toString(16).padStart(2, '0')}`.toUpperCase();
    }
    return '';
}
//#1F93FF49
function hexToRgba(hex) {
    const list = hex.match(/#(..)(..)(..)(..)?/);
    if (list) {
        return `rgba(${parseInt(list[1], 16)},${parseInt(list[2], 16)},${parseInt(list[3], 16)},${parseInt(list[4]||'64', 16)/100})`;
    }
    return '';
}
module.exports = {
    getLink: (path, id) => {
        // 如果是网址或者内部链接
        if (/(^https?:)|(^\/)/.test(path)) {
            return path;
        }
        return `${id}.html`;
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
    parseArray,
    formatObject,
    parseSimpleObject,
    parseSimpleArray,
    formatStandardObject,
    encodeURIParams(data) {
        const list = [];
        for (const key in data) {
            list.push(`${key}=${data[key]}`);
        }
        return list.join('&');
    },
    md5(text) {
        const hash = crypto.createHash('md5');
        hash.update(text);
        return hash.digest('hex');
    },
    removeModuleAndChildrenFromCache,
    rgbaToHex,
    hexToRgba,
};
