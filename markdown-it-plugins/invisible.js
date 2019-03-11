'use strict';
const container = require('./container');

module.exports = function invisible_plugin(md, page) {
    md.use(container, 'invisible', {
        validate: function(params) {
            return params.trim().match(/^invisible\s*/);
        },
        content: function (tokens, idx) {
            return '';
        },
        render: function (tokens, idx) {
            return '';
        },
    });
};
