"use strict";

import {one} from '../src/predicate-combiners'
import {sExpr, sExprLift} from '../src/sexpr'
import {makeTokenStream} from '../src/token-stream'
import {action} from './../src/parser-lifter'

import type {Predicate, PredicateResult, PredicateMatch, Tokens} from '../src/types'
import {Maybe} from 'ramda-fantasy'
const {Just, Nothing} = Maybe;

module.exports = function(describe, it, expect){

    describe('parserLifter', () => {
        it('should lift a predicate to a parser', () => {

            const eq = val => t => t === val;
            const a = eq('a'), b = eq('b');
            const rule = sExprLift(one, [",", a, a, b]);

            const getMatched = (res:PredicateMatch<T>)=> res.value;
            const parser = action((tokens)=> tokens.join('') + tokens.length, rule);
            const input = ['a', 'a', 'b', 'c'];
            expect.eq(parser(makeTokenStream(input)).map(getMatched), Just('aab3') );


        });
    });

};

