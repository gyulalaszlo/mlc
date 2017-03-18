"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const oneOf = (preds: Array<Predicate<T>>, action: (t: any)=> any = (v) => v): Predicate<T> =>
    combinator("~oneOf",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            for (let i = 0, len = preds.length; i < len; ++i) {
                const saved = t.currentIndex();
                let ret = preds[i](t);
                if (Maybe.isJust(ret)) {
                    const currentValue = ret.getOrElse({value:null}).value;
                    return ret.map((r)=> Object.assign(r,{
                        value: action(currentValue)
                    }));
                }
                // restore the state
                t.restore(saved);
            }
            return Nothing();
        });
