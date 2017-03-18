"use strict";

// curry
module.exports  = function _curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        var localArgs = arguments.length > 0 ? Array.prototype.slice.call(arguments, 0) : [];
        return fn.apply(undefined, args.concat(localArgs));
    }

};
