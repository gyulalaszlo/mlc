import type {Predicate, Tokens} from './types'
import R from 'ramda'
import {nothing, anything, one, oneOf, any, seqOf, maybe} from '../src/predicate-combiners';


export const Regex = {
    '*': [a => any(a[0]), a => a.length === 1],
    '+': [a => atLeastOne(a[0]), a => a.length === 1 ] ,
    '?': [a => maybe(a[0]), a => a.length === 1 ],
    // optional predicate matches
    '/': [oneOf, a => a.length > 0],
    // Sequence of predicate matches
    ',': [seqOf, a => a.length > 0],
};


// Takes an S-Expresion of [combinerStr, predicates...] and returns a combined parser
export function sExpr(list:Array<string|any>):Predicate<T> {
    if (list.length === 0) {
        return nothing;
    }
    // Flow didnt wanted to eat this as destructuring...
    let head:string = list[0];
    let rest:Array<Predicate<T>> = list.slice(1);

    let combiner = Regex[head];
    if (!combiner) {
        throw new Error(`Unknown combiner: '${head}'.`);
    }

    let combinerFn:(Array)=>Predicate<T> = combiner[0];
    let combinerTest = combiner[1];

    // test the arguments
    if (!combinerTest(rest)) {
        throw new Error(`Combiner '${head}' cannot be used with the given arguments.: ${JSON.stringify(rest)}`);
    }

    // convert to predicates depth-first
    let resolveArgs = R.map(R.cond([
        [Array.isArray,  sExpr],
        [R.T, R.identity],
    ]));


    return combinerFn(resolveArgs(rest));

}

