"use strict";
const {makeTokenStream, one, oneOf, any, seqOf, maybe} = require('../src/predicate-combiners');
const {sExpr, sExprLift} = require('../src/sexpr');
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

    const rulesChecker = R.curryN(3, (name, rule, examples) =>
        describe(name, () => R.map(([i, o]) => {
            describe(`${name} case: ${_j(i)} -> ${_j(o)}`, () => {
                _ruleChecker(rule)([i, o]);
            })
        }, examples)));


    describe('one()', () => {

        it('should lift a boolean element predicate to an Iterator -> Maybe predicate', () => {
            rulesChecker("one", one((t) => t < 10))([
                [[10], -1],
                [[5], 1],
                [[5, 5], 1],
                [[10, 5], -1],
            ]);
        });

    });


    // helper
    const eq = v => one(t => t === v);


    describe('functional combiners', () => {
        rulesChecker("oneOf", oneOf([eq('a'), eq('b')]))(DATA.oneOf);
        rulesChecker('any', any(eq('a')))(DATA.any);
        rulesChecker('seqOf', seqOf([eq('a'), eq('b')]))(DATA.seqOf);
        rulesChecker('maybe', maybe(eq('a')))(DATA.maybe);
    });


    describe('sExpr', () => {
        const checkSExpr = (name, s) => rulesChecker(name, sExpr(s));

        it('should parse S-expr lists', () => {
            [
                [DATA.nothing, []],
                [DATA.any, ['*', eq('a')]],
                [DATA.oneOf, ['/', eq('a'), eq('b')]],
                [DATA.seqOf, [',', eq('a'), eq('b')]],
            ].map(([res, s]) => checkSExpr(s[0] ? s[0] : 'empty', s)(res));
        });


        it('should be nestable', () => {
            checkSExpr('nested', [',', ['/', eq('a'), eq('b')], eq('c')])([
            ]);
        });


        describe('sexprLift', ()=>{
            const checkSExpr = (name, s) => rulesChecker(name, sExprLift(one, s));

            it('should lift boolean predicates', () => {
                const a = v => v === 'a';
                const b = v => v === 'b';
                [
                    [DATA.nothing, []],
                    [DATA.any, ['*', a]],
                    [DATA.oneOf, ['/', a, b]],
                    [DATA.seqOf, [',', a, b]],
                ].map(([res, s]) => checkSExpr(s[0] ? s[0] : 'empty', s)(res));
            });
        });
    });
};


const DATA = {
    nothing: [
        [[], -1],
        [['a'], -1],
        [['a', 'b'], -1],
    ],
    anything: [
        [[], -1],
        [['a'], 1],
        [[null], 1],
        [['ccccc', 'a'], 1],
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


    nested: [
        [['a', 'b', 'c'], -1],
        [['a', 'c', 'c'], 2],
        [['b', 'c', 'c'], 2],
        [['b', 'a', 'c'], -1],
    ]

};
