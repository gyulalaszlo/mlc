"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const seqOf = (preds: Array<Predicate<T>>): Predicate<T> =>
    combinator("~seqOf",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let ret;
            let start = t.save();
            for (let i = 0, len = preds.length; i < len; ++i) {
                let saved = t.save();
                ret = preds[i](t);
                if (Maybe.isNothing(ret)) {
                    t.restore(saved);
                    return Nothing();
                }
                // we  should be safe with this

            }
            return Just({tokens: t, start, end: ret.getOrElse({end: -1}).end });
        });


