"use strict";

const R = require('ramda');
const {makeTokenStream} = require('mlc-predicate-combiners');

const inputOperation = op => ([input, output]) => [op(input), output];
const outputOperation = op => ([input, output]) => [input, op(output)];
// transforms the maybe returned by the predicate into a position or -1
const getConsumed = res => res.map((t) => t.tokens.consumed()).getOrElse(-1);
const ruleChecker =
    (expect, rule) => R.pipe(
        inputOperation(R.compose(getConsumed, rule, makeTokenStream)),
        expect.eqPair);

const getValue = res => res.map((t) => t.value).getOrElse(null);
const ruleValueChecker =
    (expect, rule) => R.pipe(
        inputOperation(R.compose(getValue, rule, makeTokenStream)),
        expect.eqPair);

// Returs a checker that can check many examples
const rulesChecker = rule => R.map(ruleChecker(rule));

const examplesChecker = (describe, it, expect, checkerGenerator) =>
    R.map(([name, tests]) => {
            let checker = ruleChecker(expect, checkerGenerator(name));
            tests.forEach(
                ([input, output]) => {
                    it(`${name}: ${JSON.stringify(input)} -> ${JSON.stringify(output)}`, () => {
                        return checker([input, output]);
                    });
                });
        }
    );

module.exports = {
    inputOperation, outputOperation, getConsumed, ruleChecker, examplesChecker,
    ruleValueChecker,
};