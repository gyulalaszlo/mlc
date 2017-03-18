"use strict";

import type {Predicate, Tokens, PredicateMatch} from './types'
import * as R from 'ramda'
import {Maybe} from 'ramda-fantasy'
const {Just, Nothing} = Maybe;

type Action = (t:Array<T>)=> any;


module.exports = {
    action: R.curryN( 2, (callback:Action, rule:Predicate<T> )=> {
        return (t:Tokens<T>):Maybe<Tokens<T>> => {
            const res = rule(t);
            if (Maybe.isNothing(res)) { return res; }

            return res.map((r:PredicateMatch<T>)=>{
                return Object.assign(r, {
                    value: callback(r.value),
                });
            });
        };
    }),
}



