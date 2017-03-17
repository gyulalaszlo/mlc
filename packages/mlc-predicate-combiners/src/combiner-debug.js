"use strict";



// wraps the given combinator into a debug wrapper if DEBUG is set
export const combinator = (name: string, combinator: Predicate<T>) =>
    (typeof process.env["DEBUG"] === 'undefined')
        ? combinator
        : (() => {
            let dbg = debug(uniqueIds(`combinator:${name}`));
            return (t: Tokens<T>): Maybe<Tokens<T>> => {

                const input = t.tokens[t.idx];
                dbg(
                    '==> %s idx=%d', mainIndent.str(), t.consumed(),
                    'input=', JSON.stringify(input),
                    'tokens=', JSON.stringify(t.tokens.slice(t.consumed()))
                );

                mainIndent.inc();
                let v = combinator(t);
                mainIndent.dec();

                dbg(
                    '<== %s idx=%d', mainIndent.str(), t.consumed(),
                    'res=', v.map((r) => r.consumed()).getOrElse(-1)
                );
                return v;
            };
        })();
