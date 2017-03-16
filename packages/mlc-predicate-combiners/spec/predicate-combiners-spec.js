const {makeTokenStream, one, oneOf, any, seqOf, maybe, sExpr} = require('../src/predicate-combiners');
const R = require('ramda');

module.exports = (describe, it, expect) => {

    const log = R.curryN(2, console.log);

    // Operations
    const inputOperation = op => ([input, output]) => [op(input), output];
    const outputOperation = op => ([input, output]) => [input, op(output)];
    // transforms the maybe returned by the predicate into a position or -1
    const getConsumed = res => res.map((t) => t.consumed()).getOrElse(-1);
    const _ruleChecker =
        (rule) => R.pipe(
            inputOperation(R.compose(getConsumed, rule, makeTokenStream)),
            expect.eqPair);
    const _j = JSON.stringify;

    const rulesChecker = rule => R.map(([i, o]) => describe(` case: ${_j(i)} -> ${_j(o)}`, () => _ruleChecker(rule)));


    describe('one()', () => {

        it('should lift a boolean element predicate to an Iterator -> Maybe predicate', () => {
            rulesChecker(one((t) => t < 10))([
                [[10], -1],
                [[5], 1],
                [[5, 5], 1],
                [[10, 5], -1],
            ]);
        });

    });


    // helper
    const eq = v => one(t => t === v);


    describe('oneOf()', () => {
        it('should create a multiplexer rule', () => {
            rulesChecker(oneOf([eq('a'), eq('b')]))(DATA.oneOf);
        });
    });


    describe('any()', () => {
        it('should create a looping rule', () => {
            rulesChecker(any(eq('a')))(DATA.any);
        });
    });
    //
    //
    describe('seqOf', () => {
        it('should create a sequential rule', () => {
            let rule = seqOf([eq('a'), eq('b')]);
            rulesChecker(rule)(DATA.seqOf);

        });

    });
    //
    describe('maybe', () => {
        it('should create an optional rule', () => {
            rulesChecker(maybe(eq('a')))(DATA.maybe);
        });
    });


    describe('Regex', () => {
        it('should parse S-expr lists', () => {
            [
                [DATA.empty, []],
                [DATA.any, ['*', eq('a')]],
                [DATA.oneOf, ['/', eq('a'), eq('b')]],
                [DATA.seqOf, [',', eq('a'), eq('b')]],
            ].map(([res, s]) => rulesChecker(sExpr(s))(res));
        });
    });
};


const DATA = {
    empty: [
        [[], -1],
        [['a'], 0],
        [['a', 'b'], -1],
    ],
    any: [
        [[], 0],
        [['a'], 1],
        [['a', 'a', 'b'], 2],
        [['a', 'c', 'b'], 1],
    ],

    oneOf: [

        [['a'], 1],
        [['b'], 1],
        [['a', 'b'], 1],
        [['a', 'c'], 1],
        [['c'], -1],
    ],

    seqOf: [
        [[], -1],
        [['a'], -1],
        [['b'], -1],
        [['b', 'a'], -1],
        [['a', 'c'], -1],

        [['a', 'b'], 2],
        [['a', 'b', 'b'], 2],
        [['a', 'b', 'a'], 2],
    ],

    maybe: [
        [[], 0],
        [['a'], 1],
        [['b'], 0],
        [['b', 'a'], 0],
        [['a', 'c'], 1],

        [['c', 'a'], 0],
    ],

};
