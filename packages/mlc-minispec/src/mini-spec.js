// curry
var _c = function _curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        var localArgs = arguments.length > 0 ? Array.prototype.slice.call(arguments, 0) : [];
        return fn.apply(undefined, args.concat(localArgs));
    }

};
var _curry = _c;

// map over an object
function mapObj(fn, o) {
    var out = {};
    Object.keys(o).forEach(function (k) {
        out[k] = fn(o[k]);
    });
    return out;
}

// arity-clipped version of the standard map
function map(fn, l) {
    return l.map(function (el) {
        fn(el)
    });
}

// Assertions
// ----------


// Creates assertions from predicates
function assertFromPred(currentNameGetter) {
    var assertCount = 0;
    var outputFn = function (pred) {
        var o = function _miniSpecAssert() {
            ++assertCount;
            var err = pred.apply(undefined, arguments);
            if (err) {
                throw new Error("Failiure in " + JSON.stringify(currentNameGetter()) + "\n" + "==== " + err);
            }
        };
        return o;
    };

    outputFn.getAssertCount = function () {
        return assertCount;
    }


    return outputFn;

}


function miniSpec(assertPredicates, ok, error, done, state, specs) {
    var currentName = [];

    if (!Array.isArray(assertPredicates)) {
        throw new Error("Assert Predicates must be an array");
    }
    function getName() {
        return currentName.join(' / ');
    }

    function it(name, pred) {
        currentName.push(name);
        try {
            pred();
            state = ok(state, {name: getName()});
        } catch (e) {
            state = error(state, {name: getName(), error: e});
        }

        currentName.pop();
    }


    var makeAssert = assertFromPred(getName);
    var makeAsserts = function (predsMap) {
        return mapObj(makeAssert, predsMap);
    }
    var assertObjs = assertPredicates.map(makeAsserts);
    var asserts = Object.assign.apply(undefined, assertObjs);


    specs(it, it, asserts);
    return done(state, makeAssert.getAssertCount());

}

module.exports = miniSpec;
