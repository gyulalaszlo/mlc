var _j = JSON.stringify;

function pretty(o) {
    return JSON.stringify(o, null, '\t');
}

// curry
var _c = curry = function _curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        var localArgs = arguments.length > 0 ? Array.prototype.slice.call(arguments, 0) : [];
        return fn.apply(undefined, args.concat(localArgs));
    }

}


function assertIsDefined(val, what) {
    return (typeof val === "undefined")
        ? "Expected " + (what || "value") + " to be defined."
        : false;
}

function assertEq(a, b) {
    return (_j(a) !== _j(b))
        ? "Expected: " + pretty(expected) + "\n------\n  Got:" + pretty(got) + "\n"
        : false;
}

function assertFromPred(currentNameGetter) {
    return function (pred) {
        return function _miniSpecAssert() {
            var err = pred.apply(undefined, arguments);
            if (err) {
                throw new Error("Failiure in " + _j(currentNameGetter()) + "\n" + "==== " + err);
            }
        };
    };
}

function mapObj(fn, o) {
    var out = {};
    Object.keys(o).forEach(function (k) {
        out[k] = fn(o[k]);
    });
    return out;
}

function miniSpec(state, ok, error, done, specs) {
    var currentName = "";


    function it(name, pred) {
        var n = currentName;
        currentName = n + ":" + name;
        try {
            pred();
            state = ok(state, {name: currentName});
        } catch (e) {
            state = error(state, {name: currentName, error: e});
        }

        currentName = n;
    }

    function getName() {
        return currentName;
    }

    var makeAssert = assertFromPred(getName);
    var makeAsserts = _c(mapObj, makeAssert);
    var asserts = makeAsserts({
        eq: assertEq,
        isDefined: assertIsDefined
    });

    specs(it, it, asserts);
    return done(state);

}

module.exports = miniSpec;