"use strict";
const R = require('ramda');
const {makeTokenStream} = require('mlc-predicate-combiners');
const {Grammar} = require('../src/grammar');
// import * as R from 'ramda'
// import * as M from '../src/grammar'
// import * as M from '../../mlc-grammar/cl.es6'

// import {makeTokenStream, one, oneOf, any, seqOf, maybe} from '../src/predicate-combiners'
// import {Maybe} from 'ramda-fantasy'
// import type {Predicate, Tokens} from '../src/predicate-combiners'


// const {Just, Nothing, isNothing, isJust} = Maybe;


// const mustMatch =
//     pred => v => expect(pred(v)).toBeTruthy();
//
// const mustBe = {
//     Nothing: mustMatch(Maybe.isNothing),
//     Just: mustMatch(Maybe.isJust),
// };
//
// const tokens = makeTokenStream;


module.exports = (describe, it, expect) => {
// Operations
    const inputOperation = op => ([input, output]) => [op(input), output];
    const outputOperation = op => ([input, output]) => [input, op(output)];
// transforms the maybe returned by the predicate into a position or -1
    const getConsumed = res => res.map((t) => t.consumed()).getOrElse(-1);
    const ruleChecker =
        (rule) => R.pipe(
            inputOperation(R.compose(getConsumed, rule, makeTokenStream)),
            expect.eqPair);

    const rulesChecker = rule => R.map(ruleChecker(rule));

    describe('combinators:', () => {


        describe('CL Grammar:', () => {


            R.map(([name, tests]) => {
                    let checker = ruleChecker(Grammar[name]);
                    describe(name + ':', () => {
                        tests.forEach(
                            ([n, str]) => {
                                it(`should properly match '${str}'`, () => {
                                    return checker([str, n]);
                                });
                            });
                    });
                },

                [
                    ['atom', [
                        [3, 'foo'],
                        [6, 'foobar baz'],
                        [7, 'foo-bar baz'],
                        [3, 'foo/bar baz'],
                        [2, 'fo^o'],
                        [3, 'foo('],
                        [-1, ':foo'],
                        [-1, '^foo'],
                        [-1, '[foo'],
                        [-1, '{foo'],
                        [-1, ' {foo'],
                    ]],


                    ['key', [
                        [4, ':foo'],
                        [-1, 'foobar baz'],
                        [8, ':foo-bar baz'],
                        [8, ':foo/bar baz'],
                        [-1, 'fo^:o'],
                        [5, ':^foo('],
                        [-1, '^:foo'],
                        [-1, ':[foo'],
                        [-1, ':{foo'],
                        [-1, ': {foo'],
                    ]],

                    ['typeName', [
                        [4, '^foo'],
                        [-1, 'foobar baz'],
                        [8, '^foo-bar baz'],
                        [8, '^foo/bar baz'],
                        [12, '^foo.bar/bar'],
                        [-1, 'fo^:o'],
                        [-1, ':^foo'],
                        [-1, '^:foo('],
                        [-1, '^[foo'],
                        [-1, '^{foo'],
                        [-1, '^ {foo'],
                    ]],

                    ['symbol', [
                        [3, 'foo'],
                        [7, 'foo/bar baz'],
                        [11, 'foo-bar/baz baz'],
                        [11, 'foo.bar/baz'],
                        [12, '$foo.bar/baz'],
                        // no double
                        [7, 'foo/bar/baz'],
                        // no keys
                        [7, 'foo.bar/:baz'],
                        [3, 'foo:bar/baz'],
                        // no types in the middle
                        [7, 'foo.bar/^baz'],
                        [3, 'foo^bar/baz'],
                    ]],


                    ['integer', [
                        [-1, 'foo'],
                        [2, '12'],
                        [2, '12abc'],
                        // no floats
                        [-1, '0.12'],

                        [4, '0xff'],
                        [4, '0x12'],
                        [3, '0x1g'],
                    ]],

                    ['list', [
                        [2, '()'],
                        [3, '( )'],
                        [13, '(foo bar baz)'],
                        [16, '( foo  bar baz )'],
                        [16, '( foo \nbar baz )'],
                        [11, '(12 13 14 )'],
                        [10, '(12 13 14)'],
                        [20, '(get ^u64 :key data)'],
                        [11, '(foo (bar))'],
                        [14, '(foo (bar) ())'],
                        [-1, '(foo (bar ())'],
                        [-1, '(foo '],
                    ]],

                    ['vector', [
                        [2, '[]'],
                        [3, '[ ]'],
                        [14, '[foo bar baz ]'],
                        [13, '[foo bar baz]'],
                        [9, '[1 2 3 4]'],
                        [12, '[ [] 1 2 []]'],
                    ]],

                    ['character', [
                        [3, "'a'"],
                        [4, "'\\''"],
                        [4, "'\\t'"],
                        [4, "'\\r'"],
                        [4, "'\\n'"],

                        [-1, "'\\f'"],
                        [-1, "'ab'"],
                        [-1, "'foo"],
                    ]],


                    ['string', [
                        [5, '"foo"'],
                        [7, '"foo\\n"'],
                        [6, '"foo\n"'],
                        [7, '"foo\\""'],

                        [-1, '"foo\\f"'],
                        [-1, '"foo'],
                    ]],

                    ['map', [
                        [2, '{}'],
                        [3, '{ }'],
                        [10, '{:foo bar}'],
                        // eat the whitespace
                        [13, '{:foo bar }  '],
                        [19, '{:foo [] :bar baz} '],
                        [20, '{:foo [], :bar baz} '],
                        [24, '{(foo bar) [] 0 bar-baz}'],
                        // non-paired entries
                        [-1, '{:foo [] :foobar :bar baz} '],

                    ]],

                    ['comment', [
                        [4, ';foo'],
                        [9, '; foo bar\nbaz']
                    ]]
                ]
            );


        });

    });
}
