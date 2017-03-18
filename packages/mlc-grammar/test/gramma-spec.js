"use strict";
const R = require('ramda');
const {Grammar} = require('../src/grammar');

const {ruleChecker, ruleValueChecker} = require('./helpers/rule-checker');

module.exports = (describe, it, expect) => {

    describe('mlc grammar parsing', () => {

        R.map(([name, tests]) => {
                tests.forEach(
                    ([str, out]) => {
                        it(`${name}: should properly match '${str}'`, () => {
                            return ruleValueChecker(expect, Grammar[name])([str, out]);
                        });
                    });
            },

            [
                ['atom', [
                    ['foo', {atom: 'foo'}],
                    ['foobar baz', {atom: 'foobar'}],
                    ['foo-bar baz', {atom: 'foo-bar'}],
                    ['foo/bar baz', {atom: 'foo'}],
                    ['fo^o', {atom: 'fo'}],
                    ['foo(', {atom: 'foo'}],

                    [':foo', null],
                    ['^foo', null],
                    ['[foo', null],
                    ['{foo', null],
                    [' {foo', null],
                ]],

                //
                ['key', [
                    [':foo', {key: 'foo'}],
                    [':foo-bar baz', {key: 'foo-bar'}],
                    [':foo/bar baz', {key: 'foo/bar'}],
                    [':fo^:o', {key: 'fo^:o'}],
                    [':^foo(', {key: '^foo'}],
                    ['foobar baz', null],
                    ['^:foo', null],
                    [':[foo', null],
                    [':{foo', null],
                    [': {foo', null],
                ]],

                ['typeName', [
                    ['^foo', {type: 'foo'}],
                    ['foobar baz', null],
                    ['^foo-bar baz', {type: 'foo-bar'}],
                    ['^foo/bar baz', {type: 'bar', from: 'foo'}],
                    ['^foo.bar/bar', {type: 'bar', from: 'foo.bar'}],
                    ['fo^:o', null],
                    [':^foo', null],
                    ['^:foo(', null],
                    ['^[foo', null],
                    ['^{foo', null],
                    ['^ {foo', null],
                ]],

                ['symbol', [
                    ['foo', {symbol: 'foo'}],
                    ['foo/bar baz', {symbol: 'bar', from: 'foo'}],
                    ['foo-bar/baz baz', {symbol: 'baz', from: 'foo-bar'}],
                    ['foo.bar/baz', {symbol: 'baz', from: 'foo.bar'}],
                    ['$foo.bar/baz', {symbol: 'baz', from: '$foo.bar'}],
                    // no double
                    ['foo/bar/baz', {symbol: 'bar', from: 'foo'}],
                    // no keys
                    ['foo.bar/:baz', {symbol: 'foo.bar'}],
                    ['foo:bar/baz', {symbol: 'foo'}],
                    // no types in the middle
                    ['foo.bar/^baz', {symbol: 'foo.bar'}],
                    ['foo^bar/baz', {symbol: 'foo'}],
                ]],


                // ['integer', [
                //     [-1, 'foo'],
                //     [2, '12'],
                //     [2, '12abc'],
                //     // no floats
                //     [-1, '0.12'],
                //
                //     [4, '0xff'],
                //     [4, '0x12'],
                //     [3, '0x1g'],
                // ]],
                //
                // ['list', [
                //     [2, '()'],
                //     [3, '( )'],
                //     [13, '(foo bar baz)'],
                //     [16, '( foo  bar baz )'],
                //     [16, '( foo \nbar baz )'],
                //     [11, '(12 13 14 )'],
                //     [10, '(12 13 14)'],
                //     [20, '(get ^u64 :key data)'],
                //     [11, '(foo (bar))'],
                //     [14, '(foo (bar) ())'],
                //     [-1, '(foo (bar ())'],
                //     [-1, '(foo '],
                // ]],
                //
                // ['vector', [
                //     [2, '[]'],
                //     [3, '[ ]'],
                //     [14, '[foo bar baz ]'],
                //     [13, '[foo bar baz]'],
                //     [9, '[1 2 3 4]'],
                //     [12, '[ [] 1 2 []]'],
                // ]],
                //
                // ['character', [
                //     [3, "'a'"],
                //     [4, "'\\''"],
                //     [4, "'\\t'"],
                //     [4, "'\\r'"],
                //     [4, "'\\n'"],
                //
                //     [-1, "'\\f'"],
                //     [-1, "'ab'"],
                //     [-1, "'foo"],
                // ]],
                //
                //
                // ['string', [
                //     [5, '"foo"'],
                //     [7, '"foo\\n"'],
                //     [6, '"foo\n"'],
                //     [7, '"foo\\""'],
                //
                //     [-1, '"foo\\f"'],
                //     [-1, '"foo'],
                // ]],
                //
                // ['map', [
                //     [2, '{}'],
                //     [3, '{ }'],
                //     [10, '{:foo bar}'],
                //     // eat the whitespace
                //     [13, '{:foo bar }  '],
                //     [19, '{:foo [] :bar baz} '],
                //     [20, '{:foo [], :bar baz} '],
                //     [24, '{(foo bar) [] 0 bar-baz}'],
                //     // non-paired entries
                //     [-1, '{:foo [] :foobar :bar baz} '],
                //
                // ]],
                //
                // ['comment', [
                //     [4, ';foo'],
                //     [9, '; foo bar\nbaz']
                // ]]
            ]
        );
    });

    describe('mlc grammar consumption', () => {

        const a = [
            'atom',
            ([out, input]) => checker([out, input]),
            [
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
            ]];


        R.map(([name, tests]) => {
                let checker = ruleChecker(expect, Grammar[name]);
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

};
