"use strict";
const {makeTokenStream} = require('mlc-predicate-combiners');
const {Grammar} = require('../src/grammar');

const {ruleChecker, examplesChecker} = require('./helpers/rule-checker');

module.exports = function (describe, it, expect) {


    describe('ns', () => {
        // examplesChecker(describe, it, expect, (name) => Grammar[name])(DATA.basicModule);

        console.log(JSON.stringify(Grammar.listInner()(makeTokenStream(DATA.ex3)).value.value, null, '\t'));
        // expect.eq([], Grammar.listInner()(makeTokenStream(DATA.ex1)));

        // expect.eq(Grammar.list(makeTokenStream(DATA.ex1)), {
        //     a:'A'
        // });
    });

};


const DATA = {

    basicModule: [
        // ["list", [
        //     [`(module)`, [{list: "module"]]
        // ]]],
        ],

    ex1: `
(module
  :containers.ordered-set

  :exports [ ^OrderedSet create contains? ]

  :imports  {"core" [alloc dealloc ^block]
             "lang" [#match ^Result ^u64 ^boolean]


             ;  [^Result :from lang/^Result]
             ;  [^boolean :from lang/^boolean]
             ;  [^u64 :from lang/^uint64_t]

             ;  [^block :from core.alloc/^block]
             }
  )
`,

    ex2:`
(module

  :exports [ ^OrderedSet create contains? ]

  :imports  {"core" [alloc dealloc ^block]
             "lang" [#match ^Result ^u64 ^boolean]


             ;  [^Result :from lang/^Result]
             ;  [^boolean :from lang/^boolean]
             ;  [^u64 :from lang/^uint64_t]

             ;  [^block :from core.alloc/^block]
             }
  )



(type

  "A single entry in our ordered set"
  OrderedSetEntry (struct
                    ;; The hash of the entry.
                    :hash   ^u64
                    ;; The identifier we received from the source
                    :id     ^u64
                    )

  "An ordered set optimized for quick create-diff-destroy cycles."
  OrderedSet (struct
               ;; The data allocated as a block
               :data       ^alloc/block
               :capacity   ^u64
               :used       ^u64))


(with-symbol-types

  [this-set     ^OrderedSet
   entry        ^OrderedSetEntry
   hash         ^u64
   i            ^u64

   =>           (^core.pipe/Pipe ^OrderedSetEntry)]


  ^OrderedSet -> ^u64 -> ^boolean
  (defn contains?
    "Returns true if the entry is in the set"
    [this-set hash] ->  ^boolean

    ;; linear search for now
    (#loop [i 0]

      ;; We use #nth here, if we want speed, we could consider using
      ;; #nth-unchecked
      (#case ((#nth ^OrderedSet) (:data this-set) i)
        ;; If we get nothing back, we are over the block bounds
        ^Maybe/Nothing        false
        ;;If we have a result, get back the stuff
        ^Maybe/Just  [entry]  (#if (= (:hash entry))
                                true
                                (#recur (+ 1 i))))))

  (defn containsFn
    [this-set hash] -> ^boolean


    (=> ((#range ^OrderedSetEntry*) (:data this-set))
        ((#filter ^OrderedSetEntry*) #(= (:hash %1) hash))
        ((#not-empty ^OrderedSetEntry*))
        )
    )
  )




(defn create
  "Creates a new ordered set with initial-capacity as the capacity."

  [allocator ^alloc/Allocator
   initial-capacity ^u64] -> ^OrderedSet

  (let [size (* (alloc/#sizeof ^OrderedSet) initial-capacity)]

    ;; allocate returns potentially with errors
    (#case (alloc/allocate alloc/default ^OrderedSetEntry size)

      ;; allocate the memory for the initial set
      ^Result/Ok [data]  (OrderedSet->
                           {:data     data
                            :capacity initial-capacity
                            :used     0
                            })

      ;; handle alloc errors
      ^Result/Error [err] (Resul/Error->
                            (str "Allocation error in orderedSet:" err))


            )
    )
  )

`,


    ex3: `

;; allows to assign types to symbol appearances
(with-symbol-types

  [this-set     ^OrderedSet
   entry        ^OrderedSetEntry
   hash         ^u64
   i            ^u64

   =>           (^core.pipe/Pipe ^OrderedSetEntry)]


  ^OrderedSet -> ^u64 -> ^boolean
  (defn contains?
    "Returns true if the entry is in the set"
    [this-set hash] ->  ^boolean

    ;; linear search for now
    (#loop [i 0]

      ;; We use #nth here, if we want speed, we could consider using
      ;; #nth-unchecked
      (#case ((#nth ^OrderedSet) (:data this-set) i)
        ;; If we get nothing back, we are over the block bounds
        ^Maybe/Nothing        false
        ;;If we have a result, get back the stuff
        ^Maybe/Just  [entry]  (#if (= (:hash entry))
                                true
                                (#recur (+ 1 i))))))

  (defn containsFn
    [this-set hash] -> ^boolean


    (=> ((#range ^OrderedSetEntry*) (:data this-set))
        ((#filter ^OrderedSetEntry*)  (fn (= (:hash %1) hash)))
        ((#not-empty ^OrderedSetEntry*))))
        )

`
};



