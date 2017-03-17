"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;

export const maybe = (pred: Predicate<T>): Predicate<T> =>
    combinator("~maybe",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let saved = t.save();
            let current = pred(t);
            if (Maybe.isNothing(current)) {
                t.restore(saved);
            }
            return Just({ tokens: t, start: saved, end: t.save() } );
        });


