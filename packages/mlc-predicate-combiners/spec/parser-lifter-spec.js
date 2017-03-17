"use strict";

import {one} from '../src/predicate-combiners'
import {sExpr, sExprLift} from '../src/sexpr'
import {makeTokenStream} from '../src/token-stream'
import {liftToParser} from '../src/parser-lifter'

import {Maybe} from 'ramda-fantasy'
const {Just, Nothing} = Maybe;

module.exports = function(describe, it, expect){

/*
    describe('parserLifter', () => {
        it('should lift a predicate to a parser', () => {

            const eq = val => t => t === val;
            const a = eq('a'), b = eq('b');
            const rule = sExprLift(one, [",", a, a, b]);

            // const parser = liftToParser(rule, callback);
            // parser.input = ;
            const input = ['a', 'a', 'b', 'c'];
            expect.eq(rule(makeTokenStream(input)), Just(['a', 'a', 'b']) );



        });
    });
*/

};

