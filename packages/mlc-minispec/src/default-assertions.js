var _j = JSON.stringify;

function pretty(o) {
    return JSON.stringify(o, null, '\t');
}

module.exports = function defaultAssertions() {
    // A value must be defined
    function assertBase(val, what) {
        return val
            ? (what || "Unmet expectation encountered.")
            : false;
    }

    // A value must be defined
    function assertIsDefined(val, what) {
        return assertBase(
            (typeof val === "undefined") ,
            "Expected " + (what || "value") + " to be defined."
        )
    }

    // Two valus have to be equal
    function assertEqPair(pair) {
        var a = pair[0], b = pair[1];
        return assertBase(
            (_j(a) !== _j(b)),
            "Expected: " + pretty(b) + "\n------\n  Got: " + pretty(a) + "\n"
        );
    }

    // Two valus have to be equal
    function assertEq(a, b) {
        return assertEqPair([b,a]);
    }

    // update the assertions
    return {
        eq: assertEq,
        eqPair: assertEqPair,
        isDefined: assertIsDefined,
        isTrue: assertBase,
    };

}
