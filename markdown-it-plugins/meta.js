'use strict';
const container = require('./container');

module.exports = function meta_plugin(md, page) {
    md.use(container, 'meta', {
        validate: function(params) {
            return params.trim().match(/^meta\s*/);
        },
        content: function (tokens, idx) {
            return '';
        },
        render: function (tokens, idx) {
            return '';
        },
    });
};
