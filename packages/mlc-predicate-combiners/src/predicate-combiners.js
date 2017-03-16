"use strict";
import * as R from 'ramda'
import {Maybe} from 'ramda-fantasy'
import debug from 'debug'
import type {Tokens} from './token-stream.js'
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

export type Predicate<T> =
    (t: Tokens<T>) => Maybe<Tokens<T>>;

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
    console.log("Gettin:", t)
    return Nothing();
    // return Just(t)
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

const rx = (combiner, len) => args => [combiner, args.length > l];




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


