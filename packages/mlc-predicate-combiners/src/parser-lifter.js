"use strict";

import type {Predicate, Tokens} from './types'
import * as R from 'ramda'
import {Maybe} from 'ramda-fantasy'
const {Just, Nothing} = Maybe;

export function liftToParser(rule:Predicate<T>, callback:(T)=>any) {
    return (t:Tokens<T>):Maybe<Tokens<T>> => {
        const saved = t.save();

        R.slice(saved, res.save());
        rule(t).map(
            (res:Tokens<T>)=> res.tokens.slice(saved, res.save()));

        t.restore(saved);

    };
}