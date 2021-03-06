"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const seqOf = (preds: Array<Predicate<T>>, action: (t: Array<any>)=> any = (v) => v): Predicate<T> =>
    combinator("~seqOf",
        (t: Tokens<T>): Maybe<Tokens<T>> => {
            let ret;
            let start = t.currentIndex();
            let values = [];
            for (let i = 0, len = preds.length; i < len; ++i) {
                let saved = t.currentIndex();
                ret = preds[i](t);
                if (Maybe.isNothing(ret)) {
                    t.restore(saved);
                    return Nothing();
                }
                // we  should be safe with this
                values.push(ret.getOrElse({value:null}).value);
            }
            return ret.map((r)=> Object.assign(r,{
                tokens: t,
                start,
                end: r.end,
                value: action(values),
            }));
            // return Just({tokens: t, start, end: ret.getOrElse({end: -1}).end });
        });


