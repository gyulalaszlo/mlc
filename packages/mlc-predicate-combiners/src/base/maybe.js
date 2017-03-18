"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;

export const maybe = (pred: Predicate<T>, action: (t?: any)=> any = (v) => v): Predicate<T> =>
    combinator("~maybe",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let saved = t.currentIndex();
            let current = pred(t);
            if (Maybe.isNothing(current)) {
                t.restore(saved);
            }
            const currentValue = current.getOrElse({value: null}).value;
            return Just({
                tokens: t,
                start: saved,
                end: t.currentIndex(),
                value: action(currentValue)
            });
        });


