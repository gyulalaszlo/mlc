"use strict";
import {Maybe} from 'ramda-fantasy'

export interface Tokens<T> {
    next():{done:boolean, value?: T};
    save():SaveState;
    restore(saved: SaveState):Tokens<T>;
    // testing helper
    consumed():number;
    done():boolean;
}


export type PredicateMatch<T> = {
    tokens: Tokens<T>,
    start: number,
    end: number
}

export type PredicateResult<T> = Maybe<PredicateMatch<T>>

export type Predicate<T> =
    (t: Tokens<T>) => PredicateResult<T>;

