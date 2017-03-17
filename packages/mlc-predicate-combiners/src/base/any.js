"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, PredicateResult, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const any = (pred: Predicate<T>): Predicate<T> =>
    combinator("~any",
        (t: Tokens<T>): PredicateResult<T> => {
            const start = t.save();
            while (true) {
                // save the token stream state. Dont want to copy
                // in such an inner loop.
                let saved = t.save();
                let current = pred(t);
                if (Maybe.isNothing(current)) {
                    return Just({ tokens: t.restore(saved), start: start, end: saved });
                }
            }
        });


