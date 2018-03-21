module.exports = {
    getLink: (baseUrl, path, id) => {
        if (path.match(/^https?:/)) {
            return path;
        }
        return baseUrl + id + '.html';
    },
    support: (page, type) => {
        const { supports=[] } = page;
        return supports.indexOf(type) > -1;
    },
};
