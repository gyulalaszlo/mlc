"use strict";

import * as R from 'ramda'

import type {Predicate, Tokens, PredicateResult} from './types'
import debug from 'debug'


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

// wraps the given combinator into a debug wrapper if DEBUG is set
export const combinator = (name: string, combinator: Predicate<T>) =>
    (typeof process.env["DEBUG"] === 'undefined')
        ? combinator
        : (() => {
            let dbg = debug(uniqueIds(`combinator:${name}`));
            return (t: Tokens<T>):PredicateResult<T> => {

                const input = t.tokens[t.idx];
                const consumed = t.consumed();
                dbg(
                    '==> %s idx=%d', mainIndent.str(), consumed,
                    'input=', JSON.stringify(input),
                    'tokens=', JSON.stringify(t.tokens.slice(consumed))
                );

                mainIndent.inc();
                let v = combinator(t);
                mainIndent.dec();

                dbg(
                    '<== %s idx=%d', mainIndent.str(), t.consumed(),
                    'res=', v.map((r) => r.tokens.consumed()).getOrElse(-1)
                );
                return v;
            };
        })();

