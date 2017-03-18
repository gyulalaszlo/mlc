"use strict";
// map over an object
module.exports = function mapObj(fn, o) {
    var out = {};
    Object.keys(o).forEach(function (k) {
        out[k] = fn(o[k]);
    });
    return out;
};



