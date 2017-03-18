"use strict";

import {Maybe} from 'ramda-fantasy'
import type {Predicate, PredicateResult, Tokens} from '../types'
import {combinator} from '../combiner-debug'
const {Just, Nothing} = Maybe;


export const any = (pred: Predicate<T>,
                    action: (t: Array<any>)=> any = (v) => v): Predicate<T> =>
    combinator("~any",
        (t: Tokens<T>): PredicateResult<T> => {
            const start = t.currentIndex();
            // collect output values
            const values = [];
            while (true) {
                // currentIndex the token stream state. Dont want to copy
                // in such an inner loop.
                let saved = t.currentIndex();
                let current = pred(t);

                // break on no match
                if (Maybe.isNothing(current)) {
                    return Just({tokens: t.restore(saved), start: start, end: saved, value: values});
                }


                // get the current value from the result and add it
                // to our collection
                const currentValue = current.getOrElse({value:null}).value;
                values.push(action(currentValue));
            }
        });


