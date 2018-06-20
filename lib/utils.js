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
        for (const item of content) {
            const pair = item.split('=');
            initialValue[pair[0]] = pair[1];
        }
        return initialValue;
    },
};
