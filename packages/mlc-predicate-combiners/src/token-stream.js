export interface Tokens<T> {
    next():{done:boolean, value?: T};
    save():SaveState;
    restore(saved: SaveState):Tokens<T>;
    // testing helper
    consumed():number;
    done():boolean;
}


class TokenStream<T> implements Tokens<T> {

    constructor(tokens: Array<T> | string, start: number) {
        this.tokens = tokens;
        this.idx = start;
        this.end = tokens.length
    }


    next(): {done:boolean, i:number, value?: T} {
        let i = this.idx;
        if (i >= this.end) {
            return {done: true, i};
        }

        let value = this.tokens[i];
        this.idx = i + 1;
        return {done: false, i, value};
    }


    save(): number {
        return this.idx;
    }

    restore(idx: number): Tokens<T> {
        this.idx = idx;
        return this;
    }

    consumed() {
        return this.idx;
    }

    done() {
        return this.idx >= this.end;
    }
}


export function makeTokenStream<T>(tokens: (Array<T> | string)): Tokens<T> {
    return new TokenStream(tokens, 0);
}

