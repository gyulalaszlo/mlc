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

import {any} from './base/any'
import {oneOf} from './base/one-of'
import {seqOf} from './base/seq-of'
import {maybe} from './base/maybe'
import {combinator} from './combiner-debug'

const  identity = v => v;

// DDL for declaring a rule like a regular parser
export const rule = (name, sequence, action) => combinator(name, seqOf(sequence, action));
export const atLeastOne = (pred, action) => rule(`~at_least_one`, [pred, any(pred)],
    t => (action || identity)([t[0]].concat(t[1] ? t[1] : []))
);
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


function cache<T>(getter: ()=>T): T {
    let t: T;
    return () => (t ? t : (t = getter()));
}

// Creates a proxy rule that can break circular references:
// provide a function that returns the rule on the first invocation.
export const proxy = (name: string, predGetter: ()=>Predicate<T>): Predicate<T> => {
    let c = cache(predGetter);
    return combinator(`proxy:${name}`,
        (t: Tokens<T>): Maybe<Tokens<T>> => c()(t));
};

