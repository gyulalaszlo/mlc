"use strict";

var curry = require('./curry');
var mapObj = require('./map-obj')

// arity-clipped version of the standard map
function map(fn, l) {
    return l.map(function (el) {
        fn(el)
    });
}

// Assertions
// ----------


// Creates assertions from predicates
function assertFromPred(currentNameGetter, opts) {
    var assertCount = 0;
    var outputFn = function (pred) {
        var o = function _miniSpecAssert() {
            ++assertCount;
            var err = pred.apply(undefined, arguments);
            if (err) {
                opts.onAssertError({name: currentNameGetter()});
                var thrown = new Error("Failiure in " + JSON.stringify(currentNameGetter()));
                thrown.assertText = err.toString();
                throw thrown;
            }
            opts.onAssertOk({name: currentNameGetter()});
            return true;
        };
        return o;
    };

    outputFn.getAssertCount = function () {
        return assertCount;
    }


    return outputFn;

}

function withDefaultOptions(opts) {
    function noHandlerProvided(name) {
        return function () {
            throw new Error("No handler given for:" + name);
        }
    }

    if (opts.assertPredicates && !Array.isArray(opts.assertPredicates)) {
        throw new Error("opts.assertPredicates for mlc-minispec must be an array.");
    }

    return Object.assign({
        // simple map of { name: boolean predicate } pairs for the asserts
        // minispec will provide
        assertPredicates: [],
        // called before each node is started
        start: noHandlerProvided("start"),
        // called on each OK node
        ok: noHandlerProvided("ok"),
        // Called when errors are found
        error: noHandlerProvided("error"),
        // Called at the end of the test
        done: noHandlerProvided("done"),

        onAssertOk: noHandlerProvided("onAssertOk"),
        onAssertError: noHandlerProvided("onAssertError"),

    }, opts);
}


function miniSpec(opts, state, specs) {
    var opts = withDefaultOptions(opts);


    var currentName = [];


    function getName() {
        return currentName.join(' / ');
    }

    function it(name, pred) {
        currentName.push(name);
        try {
            state = opts.start.call(opts, state, {name: getName()});
            pred();
            state = opts.ok.call(opts, state, {name: getName()});
        } catch (e) {
            state = opts.error.call(opts, state, {name: getName(), error: e});
        }

        currentName.pop();
    }

    var assertOpts = {
        onAssertOk: function (data) { opts.onAssertOk(state, data); },
        onAssertError: function(data) { opts.onAssertError(state, data)}
    };

    var makeAssert = assertFromPred(getName, assertOpts);
    var makeAsserts = function (predsMap) {
        return mapObj(makeAssert, predsMap);
    }
    var assertObjs = opts.assertPredicates.map(makeAsserts);
    var asserts = Object.assign.apply(undefined, assertObjs);


    function runSpec(spec) {
        spec(it, it, asserts);
    }

    (Array.isArray(specs) ? specs : [specs]).forEach(runSpec);
    return opts.done.call(opts, state, makeAssert.getAssertCount());

}

module.exports = miniSpec;
