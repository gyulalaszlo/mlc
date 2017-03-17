"use strict";
import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from './types'

// Helper for building combinators
// ===========

export {combinator} from './combiner-debug'

// BASE COMBINATORS
// ----------------

export {nothing} from './base/nothing'
export {anything} from './base/anything'
export {one} from './base/one'
export {oneOf} from './base/one-of'
export {seqOf} from './base/seq-of'
export {any} from './base/any'
export {maybe} from './base/maybe'

export {makeTokenStream} from './token-stream'


// DDL for declaring a rule like a regular parser
export const rule = (name, sequence) => combinator(name, seqOf(sequence));
export const atLeastOne = pred => rule(`~at_least_one`, [pred, any(pred)]);
export const maybeSeqOf = rules => maybe(seqOf(rules));
// Zero, one or more of (any of the `rules` provided)
export const anyOf = rules => any(oneOf(rules));

// represents a list with a separator interposed between the elements
export const interpose =
    (interposerPred, elementPred) =>
        maybeSeqOf([
            elementPred,
            anyOf([
                interposerPred,
                elementPred,
            ])]);


function cache<T>(getter:()=>T):T {
    let t:T;
    return ()=> (t ? t : (t = getter()));
}

// Creates a proxy rule that can break circular references:
// provide a function that returns the rule on the first invocation.
export const proxy = (name:string, predGetter:()=>Predicate<T>):Predicate<T> => {
    let c = cache(predGetter);
    return  combinator(`proxy:${name}`,
        (t: Tokens<T>): Maybe<Tokens<T>> => c()(t));
};

