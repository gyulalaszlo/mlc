"use strict";

// RUN WITH
// ```
// DEBUG=combinator:*,-combinator:~* jasmine spec/*.es6 --filter=...
// ```
// to debug the parser

import {
    Combine,
    combinator,
    one,
    oneOf,
    any,
    seqOf,
    maybe,
    rule,
    atLeastOne,
    maybeSeqOf,
    anyOf,
    interpose,
    proxy
} from 'mlc-predicate-combiners';

import {sExpr, sExprLift} from 'mlc-predicate-combiners/sexpr'

import {action} from 'mlc-predicate-combiners/src/parser-lifter'
import type {Predicate, Tokens} from 'mlc-predicate-combiners'

const char = (rx: RegExp): Predicate<string> => combinator(`char:${rx}`,
    one(c => rx.test(c)));

const str = (s: string): Predicate<string> => combinator(`string: '${s}'`,
    s.length > 1
        ? seqOf(s.split('').map((ch) => one(c => c === ch)), (_) => s)
        : one(c => c === s)
);

// Actions

type Atom = {atom: string}
const emitAtom = action((t): Atom => ({atom: t}));
const emitKey = action((t: string): {key:string} => ({key: t.substr(1)}));
const emitTypeName = action((t: string) => ({type: t.substr(1)}));

// Grammar
// =======


// ##### Whitespace:
//
// CL is pretty agnostic when it comes to whitespace, as it has no punctuation marks
//
// - space
// - tab
// - newline / CR
// - colon (',')
const comment = rule('comment', [
    str(';'), any(char(/[^\n\r]/))
], t => null);

const whiteSpaceChar = oneOf([
    seqOf([str(';'), any(char(/[^\n\r]/))]),
    char(/[ \t\r\n,]/),
]);
const optionalWS = anyOf([whiteSpaceChar]);
const requiredWS = atLeastOne(whiteSpaceChar);


// const WS = ["rule", "",
//     ["*", ["/", whiteSpaceChar, comment]],
// ];


const atomChar = char(/[^\:\/\\\^\[\]{}();,"' \t\r\n]/);
const atom = atLeastOne(atomChar, t => ({atom: t.join('')}));

// Paths are symbols that represent stuff.
// Unlike keys (which are value constructs when used directly
// in code), they can be exported and imported from other modules.
//
// A path is an atom, and maybe a slash followed by an atom.
const symbol = oneOf([
    seqOf([atom, str('/'), atom], t => ({symbol: t[2].atom, from: t[0].atom})),
    seqOf([atom], t => ({symbol: t[0].atom})),
    // one(atom, t => ({symbol: t})),
]);

// Type characters cannot contain the key marker (as
// it does not make any sense for them
const typeName = rule('type name',
    [str('^'), symbol], ([_, {symbol, from}]) => ({ type: symbol, from: from  })
)

    // emitTypeName(rule("type name", [char(/\^/), symbol]));

// A key can contain anything apart from whitespace and
// structural elements
const keyChar = char(/[^\\\[\];,{}()"' \t\r\n]/);
const key = rule('key',
    [str(':'), atLeastOne(keyChar)],
    t => ({key: t[1].join('')})
);

// Numbers
const numberChar = char(/[0-9]/);
const hexNumberChar = char(/[0-9a-f]/);


const integer = oneOf([
    seqOf([str('0x'), atLeastOne(hexNumberChar, t => t.join(''))], t => t.join('')),
    atLeastOne(numberChar, t => t.join('')),
], t => ({integer: t}));


const number = combinator("number",
    integer);


// Strings
// -------

// A single character in a string
// const stringCharacter =
//     (quoteChar: string): Predicate<string> =>
//         combinator('character', oneOf([
//             // Regular chars
//             char(new RegExp(`[^${quoteChar}\\\\]`)),
//             // Backslash-escaping
//             seqOf([
//                 str('\\'), oneOf([
//                     char(new RegExp(`[tnr${quoteChar}\\\\]`)),
//                     // TODO: add unicode escape(?)
//                     // seqOf([ str('u'), integer ]),
//                 ]),
//             ], t => t.join('')),
//
//         ]));

const stringCharacter =
    (quoteChar:string): Predicate<string> =>
    oneOf([
        // Regular chars
        char(new RegExp(`[^${quoteChar}\\\\]`)),
        seqOf([ str('\\'), str(quoteChar)], t => quoteChar),
        seqOf([ str('\\'), str('n')], t => '\n'),
        seqOf([ str('\\'), str('r')], t => '\r'),
        seqOf([ str('\\'), str('t')], t => '\t'),
    ]);

// (Almost) equivalent to C's `char` type
const character = rule("character", [
    str("'"), stringCharacter("'"), str("'")], t => ({char: t[1]}));

// String literal. Until instantiated, its format can be anything (UTF-8, -16, etc)
const string = rule("string", [
    str('"'), any(stringCharacter('"')), str('"')], t => ({ string: t[1].join('')}));


const basicValue = combinator('basic value', sExpr(
    ["/", integer, symbol, key, character, string]));


const listElement = proxy('list element', () =>
    oneOf([
        basicValue,
        typeName,
        list,
        lambda,
        vector,
        map,
    ]));

// Listlike elements have a specified start and end and they
// must have some kind of separator between them
const listInner =
    (elements: Predicate<string> = listElement, action:(any)=> any = (t)=> t)=>
        rule("list inner", [
            optionalWS,
            interpose(requiredWS, elements),
            optionalWS], t => t[1]);
//
// Vector, List and Map
const listLike =
    (name: string, start: RegExp, end: RegExp, elements: Predicate<string>, action:(any)=> any = (t) => t) =>
        rule(name, [
            char(start),
            listInner(elements),
            optionalWS,
            char(end) //, optionalWS,
        ],  t => (action || (t => t) )(t[1]));

// List are the most basic value type in CL.
// This is a major difference in CL from the traditional LISP
// families: as C has no concept of them, its easiest to use them as
// representing execution flow in a program.
const list = listLike("list", /\(/, /\)/, listElement, t => ({list:t ?  t : []}));
const lambda = listLike("lambda", /#\(/, /\)/, listElement, t => ({lambda:t ?  t : []}));

// Vectors are the basic datatype for CL.
const vector = listLike("vector", /\[/, /\]/, listElement, t => ({vector: t ? t : []}));


// Pairs in a map can be any structure, as they are always processed
// before instantiation.
// TODO: check the whitespace handling here
const mapPair = rule('map key-value pair', [
    listElement, optionalWS, listElement,
], ([k,_,v]) => [k,v] );

// Maps are meta-structures that are used in metaprogramming to
// represent any kind of association (creating structs on the fly
// and generally describing relations).
// Its important to understand that "Maps" in the syntax dont
// correspond to an actual data structure in the running code,
// but rather are tools for you to describe your intentions and
// clarify code.
const map = listLike("map", /\{/, /\}/, mapPair, t => ({map: t ? t : []}));


const Grammar = {
    atom, key, typeName, symbol, integer, listInner, list, lambda, vector, map, string, character, comment, keyValueMap: map
};

module.exports = {Grammar};


