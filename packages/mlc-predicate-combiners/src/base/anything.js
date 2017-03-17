"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
const {Just, Nothing} = Maybe;


// Unity predicate that accepts any single input
export function anything(t: Tokens<T>): Maybe<Tokens<T>> {
    let v = t.next();
    return (!v.done)
        ? Just(t)
        : Nothing();
}
