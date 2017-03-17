"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
const {Just, Nothing} = Maybe;

// Unity predicate that accepts nothing
export function nothing(t: Tokens<T>): Maybe<Tokens<T>> {
    return Nothing();
}
