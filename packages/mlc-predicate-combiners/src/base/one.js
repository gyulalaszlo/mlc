"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const one = (pred: (t: T) => boolean): Predicate<T> =>
    combinator("~one",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let v = t.next();
            return (!v.done && pred(v.value))
                ? Just(t)
                : Nothing();
        });
