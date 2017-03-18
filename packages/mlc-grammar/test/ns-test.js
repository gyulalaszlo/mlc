"use strict";
const {makeTokenStream} = require('mlc-predicate-combiners');
const {Grammar} = require('../src/grammar');

const {ruleChecker, examplesChecker} = require('./helpers/rule-checker');

module.exports = function (describe, it, expect) {


    describe('ns', () => {
        // examplesChecker(describe, it, expect, (name) => Grammar[name])(DATA.basicModule);


        // expect.eq(Grammar.list(makeTokenStream(DATA.ex1)), {
        //     a:'A'
        // });
    });

};


const DATA = {

    basicModule: [
        ["list", [
            [`(module)`, ["module"]]
        ]]],

    ex1: `(module
  :containers.ordered-set

  :exports [ ^OrderedSet create ^contains? ]

  :imports  {"core" [alloc dealloc ^block]
             "lang" [#match ^Result ^u64 ^boolean]


             ;  [^Result :from lang/^Result]
             ;  [^boolean :from lang/^boolean]
             ;  [^u64 :from lang/^uint64_t]

             ;  [^block :from core.alloc/^block]
             }
  )
`
};



