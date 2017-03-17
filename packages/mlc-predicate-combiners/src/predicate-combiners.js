"use strict";
import * as R from 'ramda'
import {Maybe} from 'ramda-fantasy'
import debug from 'debug'
import type {Predicate, Tokens} from './types'
import * as tokenStream from './token-stream'

const {Just, Nothing} = Maybe;

export const makeTokenStream = tokenStream.makeTokenStream;


// Unique Ids for debug
// ====================

const uniqueId = () => {
    let num = 0;
    return (prefix) => `${prefix}-${++num}`
};

const uniqueIds = uniqueId();


const indenter = () => {
    let v = 0;
    return {
        inc: () => ++v,
        dec: () => --v,
        str: () => R.repeat('.', v).join('')
    }
};

const mainIndent = indenter();

// Combinators
// ===========


// wraps the given combinator into a debug wrapper if DEBUG is set
export const combinator = (name: string, combinator: Predicate<T>) =>
    (typeof process.env["DEBUG"] === 'undefined')
        ? combinator
        : (() => {
            let dbg = debug(uniqueIds(`combinator:${name}`));
            return (t: Tokens<T>): Maybe<Tokens<T>> => {

                const input = t.tokens[t.idx];
                dbg(
                    '==> %s idx=%d', mainIndent.str(), t.consumed(),
                    'input=', JSON.stringify(input),
                    'tokens=', JSON.stringify(t.tokens.slice(t.consumed()))
                );

                mainIndent.inc();
                let v = combinator(t);
                mainIndent.dec();

                dbg(
                    '<== %s idx=%d', mainIndent.str(), t.consumed(),
                    'res=', v.map((r) => r.consumed()).getOrElse(-1)
                );
                return v;
            };
        })();


// BASE COMBINATORS
// ----------------

// Unity predicate that accepts nothing
export function nothing(t: Tokens<T>): Maybe<Tokens<T>> {
    return Nothing();
}

// Unity predicate that accepts any single input
export function anything(t: Tokens<T>): Maybe<Tokens<T>> {
    let v = t.next();
    return (!v.done)
        ? Just(t)
        : Nothing();
}

export const one = (pred: (t: T) => boolean): Predicate<T> =>
    combinator("~one",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let v = t.next();
            return (!v.done && pred(v.value))
                ? Just(t)
                : Nothing();
        });

export const oneOf = (preds: Array<Predicate<T>>): Predicate<T> =>
    combinator("~oneOf",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            for (let i = 0, len = preds.length; i < len; ++i) {
                const saved = t.save();
                let ret = preds[i](t);
                if (Maybe.isJust(ret)) return ret;
                // restore the state
                t.restore(saved);
            }
            return Nothing();
        });

export const any = (pred: Predicate<T>): Predicate<T> =>
    combinator("~any",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            while (true) {
                // save the token stream state. Dont want to copy
                // in such an inner loop.
                let saved = t.save();
                let current = pred(t);
                if (Maybe.isNothing(current)) {
                    return Just(t.restore(saved));
                }
            }
        });


export const seqOf = (preds: Array<Predicate<T>>): Predicate<T> =>
    combinator("~seqOf",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            for (let i = 0, len = preds.length; i < len; ++i) {
                let saved = t.save();
                let ret = preds[i](t);
                if (Maybe.isNothing(ret)) {
                    t.restore(saved);
                    return Nothing();
                }
                // we  should be safe with this

            }
            return Just(t);
        });


export const maybe = (pred: Predicate<T>): Predicate<T> =>
    combinator("~maybe",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let saved = t.save();
            let current = pred(t);
            if (Maybe.isNothing(current)) {
                t.restore(saved);
            }
            return Just(t);
        });


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
