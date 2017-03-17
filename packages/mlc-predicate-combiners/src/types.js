"use strict";

export interface Tokens<T> {
    next():{done:boolean, value?: T};
    save():SaveState;
    restore(saved: SaveState):Tokens<T>;
    // testing helper
    consumed():number;
    done():boolean;
}


export type Predicate<T> =
    (t: Tokens<T>) => Maybe<Tokens<T>>;
