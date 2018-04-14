module.exports = {
    getLink: (path, id) => {
        if (path.match(/^https?:/)) {
            return path;
        }
        return id + '.html';
    },
    support: (page, type) => {
        const { supports=[] } = page;
        return supports.indexOf(type) > -1;
    },
};
