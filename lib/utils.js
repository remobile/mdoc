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
};
