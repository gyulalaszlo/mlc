"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
const {Just, Nothing} = Maybe;


// Unity predicate that accepts any single input
export function anything(t: Tokens<T>): Maybe<Tokens<T>> {
    let start = t.currentIndex();
    let v = t.next();
    let end = t.currentIndex();
    return (!v.done)
        ? Just({tokens: t, start, end, value: t.tokens.split(start, end)})
        : Nothing();
}