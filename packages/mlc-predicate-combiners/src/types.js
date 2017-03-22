"use strict";
import {Maybe, Either} from 'ramda-fantasy'

//
// // ## Cursors
// //
//
// // Interface that describes the requirements
// // for a cursor to a typed list that can be parsed.
// export interface CursorT {
//     // Returns the current value of the token under the cursor
//     // the provided default value.
//     getOrElse<T>(t: T):T;
//
//
//     // Returns a new cursor corresponding to the
//     // next position in the input
//     next() : CursorT;
// }
//
//
// // Algebraeic cursor?
// // ==================
//
//
//
// interface CursorLike<Type, A> {
//     // Returns the type of this instance
//     T(): Type;
//     ErrorT():
//
//     // reqs:
//     // 1. `u.map(a => a)` is equivalent to `u` (identity)
//     // 2. `u.map(x => f(g(x)))` is equivalent to `u.map(g).map(f)` (composition)
//     //
//     // 1. `v.ap(u.ap(a.map(f => g => x => f(g(x)))))` is equivalent to `v.ap(u).ap(a)` (composition)
//     //
//     // 1. `v.ap(A.of(x => x))` is equivalent to `v` (identity)
//     // 2. `A.of(x).ap(A.of(f))` is equivalent to `A.of(f(x))` (homomorphism)
//     // 3. `A.of(y).ap(u)` is equivalent to `u.ap(A.of(f => f(y)))` (interchange)
//     //
//     // 1. `m.chain(f).chain(g)` is equivalent to `m.chain(x => f(x).chain(g))` (associativity)
//     //
//     // 1. `M.of(a).chain(f)` is equivalent to `f(a)` (left identity)
//     // 2. `m.chain(M.of)` is equivalent to `m` (right identity)
//     //
//     // 1. `p.bimap(a => a, b => b)` is equivalent to `p` (identity)
//     // 2. `p.bimap(a => f(g(a)), b => h(i(b))` is equivalent to `p.bimap(g, i).bimap(f, h)` (composition)
//
//     // map :: Functor f => f a ~> (a -> b) -> f b
//     map<B>(f: (a: A)=>B) : CursorLike<Type, B>;
//
//     // ap :: Apply f => f a ~> f (a -> b) -> f b
//     ap<B>(b: CursorLike<Type, (a: A) => B>): CursorLike<Type, B>;
//
//     // chain :: Chain m => m a ~> (a -> m b) -> m b
//     chain<B>( f: (a:A ) => CursorLike<Type, B> ): CursorLike<Type, B>;
//
//     isError():boolean;
//     isOk():boolean;
//
//     // bimap :: Bifunctor f => f a c ~> (a -> b, c -> d) -> f b d
//
//     bimap
// }
//
//
// // The actual type (for static shit)
// interface CursorLikeT {
//     // of :: Applicative f => a -> f a
//     of<A>(a: A): CursorLike<CursorLikeT, A>;
// }

export function Identity<T>(a:T):T { return a; }


// A cursor should support two operations:
// advance forward and
export interface CursorLike<T> {
    next(): Maybe<CursorLike>;
    value(): T;
}

export interface CursorError<Cursor> {
    // The cursor where this error occured
    cursor: Cursor,

    // Some custom message
    message: string,
}


// =-=====================

// The input for a predicate (wraps the cursor and the current value
export type PInput<Cursor, V> = {cursor: Cursor, value:V}
// The result from a cursor predicate
export type PResult<Cursor, V> = Either< CursorError<Cursor>, PInput<Cursor, V> >;
// reduction predicate
export type CursorPredicate<Cursor, V> = (cursor: Cursor) => PResult<Cursor, V>;

export const POk = Either.Right;
export const PError = Either.Left;


// Parser round 1.

export interface Tokens<T> {
    next():{done:boolean, value?: T};
    currentIndex():SaveState;
    restore(saved: SaveState):Tokens<T>;
    // testing helper
    consumed():number;
    done():boolean;
}


export type PredicateMatch<T> = {
    tokens: Tokens<T>,
    start: number,
    end: number,

    // the value returned after matching the string
    value: any,
}

export type PredicateResult<T> = Maybe<PredicateMatch<T>>

export type Predicate<T> =
    (t: Tokens<T>) => PredicateResult<T>;

