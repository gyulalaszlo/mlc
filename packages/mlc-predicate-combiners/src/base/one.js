"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, PredicateResult, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const one = (pred: (t: T) => boolean, action: (t: T)=> any = (v)=> v): Predicate<T> =>
    combinator("~one",
        (t: Tokens<T>): PredicateResult<T> => {
            const start = t.currentIndex();
            let v = t.next();
            return (!v.done && pred(v.value))
                ? Just({tokens: t, start, end: t.currentIndex(), value: action( v.value )})
                : Nothing();
        });
