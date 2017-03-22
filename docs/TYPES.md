# Fantasy Land Specification

(aka "Algebraic JavaScript Specification")


This project specifies interoperability of common algebraic
structures:

* [Setoid](#setoid)
* [Semigroup](#semigroup)
* [Monoid](#monoid)
* [Functor](#functor)
* [Contravariant](#contravariant)
* [Apply](#apply)
* [Applicative](#applicative)
* [Alt](#alt)
* [Plus](#plus)
* [Alternative](#alternative)
* [Foldable](#foldable)
* [Traversable](#traversable)
* [Chain](#chain)
* [ChainRec](#chainrec)
* [Monad](#monad)
* [Extend](#extend)
* [Comonad](#comonad)
* [Bifunctor](#bifunctor)
* [Profunctor](#profunctor)

<img src="figures/dependencies.png" width="888" height="289" />

## Algebras

### Setoid

1. `a.equals(a) === true` (reflexivity)
2. `a.equals(b) === b.equals(a)` (symmetry)
3. If `a.equals(b)` and `b.equals(c)`, then `a.equals(c)` (transitivity)

```hs
equals :: Setoid a => a ~> a -> Boolean
```

### Semigroup

1. `a.concat(b).concat(c)` is equivalent to `a.concat(b.concat(c))` (associativity)

```hs
concat :: Semigroup a => a ~> a -> a
```

### Monoid

A value that implements the Monoid specification must also implement
the [Semigroup](#semigroup) specification.

1. `m.concat(M.empty())` is equivalent to `m` (right identity)
2. `M.empty().concat(m)` is equivalent to `m` (left identity)

```hs
empty :: Monoid m => () -> m
```

### Functor

1. `u.map(a => a)` is equivalent to `u` (identity)
2. `u.map(x => f(g(x)))` is equivalent to `u.map(g).map(f)` (composition)

```hs
map :: Functor f => f a ~> (a -> b) -> f b
```

### Contravariant

1. `u.contramap(a => a)` is equivalent to `u` (identity)
2. `u.contramap(x => f(g(x)))` is equivalent to `u.contramap(f).contramap(g)`
(composition)


```hs
contramap :: Contravariant f => f a ~> (b -> a) -> f b
```

### Apply

A value that implements the Apply specification must also
implement the [Functor](#functor) specification.

1. `v.ap(u.ap(a.map(f => g => x => f(g(x)))))` is equivalent to `v.ap(u).ap(a)` (composition)

```hs
ap :: Apply f => f a ~> f (a -> b) -> f b
```

### Applicative

A value that implements the Applicative specification must also
implement the [Apply](#apply) specification.

1. `v.ap(A.of(x => x))` is equivalent to `v` (identity)
2. `A.of(x).ap(A.of(f))` is equivalent to `A.of(f(x))` (homomorphism)
3. `A.of(y).ap(u)` is equivalent to `u.ap(A.of(f => f(y)))` (interchange)

```hs
of :: Applicative f => a -> f a
```

### Alt

A value that implements the Alt specification must also implement
the [Functor](#functor) specification.

1. `a.alt(b).alt(c)` is equivalent to `a.alt(b.alt(c))` (associativity)
2. `a.alt(b).map(f)` is equivalent to `a.map(f).alt(b.map(f))` (distributivity)


```hs
alt :: Alt f => f a ~> f a -> f a
```

### Plus

A value that implements the Plus specification must also implement
the [Alt](#alt) specification.

1. `x.alt(A.zero())` is equivalent to `x` (right identity)
2. `A.zero().alt(x)` is equivalent to `x` (left identity)
2. `A.zero().map(f)` is equivalent to `A.zero()` (annihilation)


```hs
zero :: Plus f => () -> f a
```

### Alternative

A value that implements the Alternative specification must also implement
the [Applicative](#applicative) and [Plus](#plus) specifications.

1. `x.ap(f.alt(g))` is equivalent to `x.ap(f).alt(x.ap(g))` (distributivity)
1. `x.ap(A.zero())` is equivalent to `A.zero()` (annihilation)

### Foldable

1. `u.reduce` is equivalent to `u.reduce((acc, x) => acc.concat([x]), []).reduce`

#### `reduce` method

```hs
reduce :: Foldable f => f a ~> ((b, a) -> b, b) -> b
```

A value which has a Foldable must provide a `reduce` method. The `reduce`
method takes two arguments:

    u.reduce(f, x)

1. `f` must be a binary function

    1. if `f` is not a function, the behaviour of `reduce` is unspecified.
    2. The first argument to `f` must be the same type as `x`.
    3. `f` must return a value of the same type as `x`.
    4. No parts of `f`'s return value should be checked.

1. `x` is the initial accumulator value for the reduction

    1. No parts of `x` should be checked.

### Traversable

A value that implements the Traversable specification must also
implement the [Functor](#functor) and [Foldable](#foldable) specifications.

1. `t(u.traverse(F, x => x))` is equivalent to `u.traverse(G, t)` for any
   `t` such that `t(a).map(f)` is equivalent to `t(a.map(f))` (naturality)

2. `u.traverse(F, F.of)` is equivalent to `F.of(u)` for any Applicative `F`
   (identity)

3. `u.traverse(Compose, x => new Compose(x))` is equivalent to
   `new Compose(u.traverse(F, x => x).map(x => x.traverse(G, x => x)))` for
   `Compose` defined below and any Applicatives `F` and `G` (composition)

```js
var Compose = function(c) {
  this.c = c;
};

Compose.of = function(x) {
  return new Compose(F.of(G.of(x)));
};

Compose.prototype.ap = function(f) {
  return new Compose(this.c.ap(f.c.map(u => y => y.ap(u))));
};

Compose.prototype.map = function(f) {
  return new Compose(this.c.map(y => y.map(f)));
};
```

#### `traverse` method

```hs
traverse :: Applicative f, Traversable t => t a ~> (TypeRep f, a -> f b) -> f (t b)
```

A value which has a Traversable must provide a `traverse` method. The `traverse`
method takes two arguments:

    u.traverse(A, f)

1. `A` must be the [type representative](#type-representatives) of an
   Applicative.

2. `f` must be a function which returns a value

    1. If `f` is not a function, the behaviour of `traverse` is
       unspecified.
    2. `f` must return a value of the type represented by `A`.

3. `traverse` must return a value of the type represented by `A`.

### Chain

A value that implements the Chain specification must also
implement the [Apply](#apply) specification.

1. `m.chain(f).chain(g)` is equivalent to `m.chain(x => f(x).chain(g))` (associativity)

#### `chain` method

```hs
chain :: Chain m => m a ~> (a -> m b) -> m b
```

A value which has a Chain must provide a `chain` method. The `chain`
method takes one argument:

    m.chain(f)

1. `f` must be a function which returns a value

    1. If `f` is not a function, the behaviour of `chain` is
       unspecified.
    2. `f` must return a value of the same Chain

2. `chain` must return a value of the same Chain

### ChainRec

A value that implements the ChainRec specification must also implement the [Chain](#chain) specification.

1. `M.chainRec((next, done, v) => p(v) ? d(v).map(done) : n(v).map(next), i)`
   is equivalent to
   `(function step(v) { return p(v) ? d(v) : n(v).chain(step); }(i))` (equivalence)
2. Stack usage of `M.chainRec(f, i)` must be at most a constant multiple of the stack usage of `f` itself.

#### `chainRec` method

```hs
chainRec :: ChainRec m => ((a -> c, b -> c, a) -> m c, a) -> m b
```

A Type which has a ChainRec must provide a `chainRec` function on its
[type representative](#type-representatives). The `chainRec` function
takes two arguments:

    M.chainRec(f, i)

Given a value `m`, one can access its type representative via the
`constructor` property:

    m.constructor.chainRec(f, i)

1. `f` must be a function which returns a value
    1. If `f` is not a function, the behaviour of `chainRec` is unspecified.
    2. `f` takes three arguments `next`, `done`, `value`
        1. `next` is a function which takes one argument of same type as `i` and can return any value
        2. `done` is a function which takes one argument and returns the same type as the return value of `next`
        3. `value` is some value of the same type as `i`
    3. `f` must return a value of the same ChainRec which contains a value returned from either `done` or `next`
2. `chainRec` must return a value of the same ChainRec which contains a value of same type as argument of `done`

### Monad

A value that implements the Monad specification must also implement
the [Applicative](#applicative) and [Chain](#chain) specifications.

1. `M.of(a).chain(f)` is equivalent to `f(a)` (left identity)
2. `m.chain(M.of)` is equivalent to `m` (right identity)

### Extend

A value that implements the Extend specification must also implement the [Functor](#functor) specification.

1. `w.extend(g).extend(f)` is equivalent to `w.extend(_w => f(_w.extend(g)))`

#### `extend` method

```hs
extend :: Extend w => w a ~> (w a -> b) -> w b
```

An Extend must provide an `extend` method. The `extend`
method takes one argument:

     w.extend(f)

1. `f` must be a function which returns a value

    1. If `f` is not a function, the behaviour of `extend` is
       unspecified.
    2. `f` must return a value of type `v`, for some variable `v` contained in `w`.
    3. No parts of `f`'s return value should be checked.

2. `extend` must return a value of the same Extend.

### Comonad

A value that implements the Comonad specification must also implement the [Extend](#extend) specification.

1. `w.extend(_w => _w.extract())` is equivalent to `w`
2. `w.extend(f).extract()` is equivalent to `f(w)`

#### `extract` method

```hs
extract :: Comonad w => w a ~> () -> a
```

A value which has a Comonad must provide an `extract` method on itself.
The `extract` method takes no arguments:

    w.extract()

1. `extract` must return a value of type `v`, for some variable `v` contained in `w`.
    1. `v` must have the same type that `f` returns in `extend`.

### Bifunctor

A value that implements the Bifunctor specification must also implement
the [Functor](#functor) specification.

1. `p.bimap(a => a, b => b)` is equivalent to `p` (identity)
2. `p.bimap(a => f(g(a)), b => h(i(b))` is equivalent to `p.bimap(g, i).bimap(f, h)` (composition)

#### `bimap` method

```hs
bimap :: Bifunctor f => f a c ~> (a -> b, c -> d) -> f b d
```

A value which has a Bifunctor must provide a `bimap` method. The `bimap`
method takes two arguments:

    c.bimap(f, g)

1. `f` must be a function which returns a value

    1. If `f` is not a function, the behaviour of `bimap` is unspecified.
    2. `f` can return any value.
    3. No parts of `f`'s return value should be checked.

2. `g` must be a function which returns a value

    1. If `g` is not a function, the behaviour of `bimap` is unspecified.
    2. `g` can return any value.
    3. No parts of `g`'s return value should be checked.

3. `bimap` must return a value of the same Bifunctor.

### Profunctor

A value that implements the Profunctor specification must also implement
the [Functor](#functor) specification.

1. `p.promap(a => a, b => b)` is equivalent to `p` (identity)
2. `p.promap(a => f(g(a)), b => h(i(b)))` is equivalent to `p.promap(f, i).promap(g, h)` (composition)

#### `promap` method

```hs
promap :: Profunctor p => p b c ~> (a -> b, c -> d) -> p a d
```

A value which has a Profunctor must provide a `promap` method.

The `profunctor` method takes two arguments:

    c.promap(f, g)

1. `f` must be a function which returns a value

    1. If `f` is not a function, the behaviour of `promap` is unspecified.
    2. `f` can return any value.
    3. No parts of `f`'s return value should be checked.

2. `g` must be a function which returns a value

    1. If `g` is not a function, the behaviour of `promap` is unspecified.
    2. `g` can return any value.
    3. No parts of `g`'s return value should be checked.

3. `promap` must return a value of the same Profunctor

## Derivations

When creating data types which satisfy multiple algebras, authors may choose
to implement certain methods then derive the remaining methods. Derivations:

  - [`map`][] may be derived from [`ap`][] and [`of`][]:

    ```js
    function(f) { return this.ap(this.of(f)); }
    ```

  - [`map`][] may be derived from [`chain`][] and [`of`][]:

    ```js
    function(f) { return this.chain(a => this.of(f(a))); }
    ```

  - [`map`][] may be derived from [`bimap`]:

    ```js
    function(f) { return this.bimap(a => a, f); }
    ```

  - [`map`][] may be derived from [`promap`]:

    ```js
    function(f) { return this.promap(a => a, f); }
    ```

  - [`ap`][] may be derived from [`chain`][]:

    ```js
    function(m) { return m.chain(f => this.map(f)); }
    ```

  - [`reduce`][] may be derived as follows:

    ```js
    function(f, acc) {
      function Const(value) {
        this.value = value;
      }
      Const.of = function(_) {
        return new Const(acc);
      };
      Const.prototype.map = function(_) {
        return this;
      };
      Const.prototype.ap = function(b) {
        return new Const(f(b.value, this.value));
      };
      return this.traverse(x => new Const(x), Const.of).value;
    }
    ```

  - [`map`][] may be derived as follows:

    ```js
    function(f) {
      function Id(value) {
        this.value = value;
      };
      Id.of = function(x) {
        return new Id(x);
      };
      Id.prototype.map = function(f) {
        return new Id(f(this.value));
      };
      Id.prototype.ap = function(b) {
        return new Id(this.value(b.value));
      };
      return this.traverse(x => Id.of(f(x)), Id.of).value;
    }
    ```

If a data type provides a method which *could* be derived, its behaviour must
be equivalent to that of the derivation (or derivations).

## Notes

1. If there's more than a single way to implement the methods and
   laws, the implementation should choose one and provide wrappers for
   other uses.
2. It's discouraged to overload the specified methods. It can easily
   result in broken and buggy behaviour.
3. It is recommended to throw an exception on unspecified behaviour.
4. An `Id` container which implements many of the methods is provided in
   `internal/id.js`.


[`ap`]: #ap-method
[`bimap`]: #bimap-method
[`chain`]: #chain-method
[`concat`]: #concat-method
[`empty`]: #empty-method
[`equals`]: #equals-method
[`extend`]: #extend-method
[`extract`]: #extract-method
[`map`]: #map-method
[`of`]: #of-method
[`promap`]: #promap-method
[`reduce`]: #reduce-method
[`sequence`]: #sequence-method

## Alternatives

There also exists [Static Land Specification](https://github.com/rpominov/static-land)
with the exactly same ideas as Fantasy Land but based on static methods instead of instance methods.