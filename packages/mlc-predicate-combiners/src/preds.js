"use strict";

import {POk, PError} from './types'
import type {PInput, PResult, CursorPredicate} from './types'

// The empty predicate.

// Matches if the cursor is exhausted
export function nothing<Cursor>(cursor:Cursor):PResult<Cursor,null> {

}