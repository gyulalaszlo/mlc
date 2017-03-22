{-

   SSASample
   -------

   <Describe me if possible...>

-}


module SSA.SSASample exposing (sample)

import Dict
import SSA.SSAForm exposing (..)


-- import Html exposing (Html)


block : LabelName -> SSANodeEntry -> SSANodeExit -> List Symbol -> List Instruction -> List Symbol -> Block
block name entry exit inputs i s =
    { label = name
    , inputs = inputs
    , body =
        i
        -- metadata about the kind of node this block is
    , node = SSANode entry exit
    , symbolsAdded = s
    , symbols = KeepSymbolScope
    }


withLabel : LabelName -> Blocks -> BlocksWithLabel
withLabel l b =
    ( l, b )


blocksWithLabel : LabelName -> SSANodeEntry -> SSANodeExit -> List Symbol -> List Instruction -> List Symbol -> BlocksWithLabel
blocksWithLabel name entry exit inputs i s =
    withLabel name [ block name entry exit inputs i s ]


sizeT =
    UnsignedIntegral Bits64


charT =
    ConstType (SignedIntegral Bits8)


strT =
    (PointerType char)


boolT =
    SignedIntegral Bits1


nDefn =
    "defn indexOfChar"


nStrlen =
    "let [len (C/strlen s)]"


nLoop =
    "loop [i 0]"


nLoopIf =
    "if (< i len)"


nCharIf =
    "= (nth i s)"


nReturnI =
    "i"


nRecur =
    "recur (+ i 1)"


type alias BlocksWithLabel =
    ( String, Blocks )



-- MACROS
-- ======


headLabel : Blocks -> Maybe String
headLabel b =
    case b of
        [] ->
            Nothing

        x :: _ ->
            Just x.label


wrap : (SSANodeExit -> BlocksWithLabel) -> BlocksWithLabel -> BlocksWithLabel
wrap f ( l, body ) =
    let
        --        b = headLabel body
        --            |> Maybe.map LocalCall
        --            |> Maybe.withDefault (ReturnCall ("", Void))
        b =
            if l == "" then
                (ReturnCall ( "", Void ))
            else
                (LocalCall l)

        ( newLabel, newHead ) =
            f b

        --        newLabel = newHead.label
    in
        ( newLabel, List.append newHead body )




type alias Binding =
    ( Symbol, Value )


withBindings : String -> List Binding -> BlocksWithLabel -> BlocksWithLabel
withBindings blockName binds =
    let
        bindingName t =
            Tuple.first <| Tuple.first t

        name =
            wrapName blockName <| String.join ", " <| List.map bindingName binds

        -- binding are added to the inputs of the next block
        newInputs =
            List.map Tuple.first binds

        exported =
            List.map Tuple.first binds

        bindingBlock exitType =
            withLabel name
                [ { label = name
                  , inputs = []
                  , body =
                        List.map (\( s, v ) -> Constant s v) binds
                        -- metadata about the kind of node this block is
                  , node = SSANode LocalEntry exitType
                  , symbolsAdded = exported
                  , symbols = KeepSymbolScope
                  }
                ]
    in
        wrap bindingBlock


wrapName : String -> String -> String
wrapName prefix a =
    "\"" ++ prefix ++ " " ++ a ++ "\""



-- Instruction generators
-- ======================


defn : String -> List Symbol -> BlocksWithLabel -> BlocksWithLabel
defn name args =
    wrap <|
        \exitType ->
            blocksWithLabel (wrapName "defn" name) PublicEntry exitType args [] args


let_ : List ( Symbol, Value ) -> BlocksWithLabel -> BlocksWithLabel
let_ =
    withBindings "let"


loop : List ( Symbol, Value ) -> BlocksWithLabel -> BlocksWithLabel
loop =
    withBindings "loop"


if_ : BlocksWithLabel -> BlocksWithLabel -> BlocksWithLabel -> BlocksWithLabel
if_ cond true false =
    let
        ( condFnName, condFnBlocks ) =
            cond

        n =
            "if"

        -- TODO: use real shit here instead
        branchBlock name exit =
            blocksWithLabel (n ++ "." ++ name) LocalEntry exit [] [] []

        trueB =
            wrap (branchBlock "true") true

        falseB =
            wrap (branchBlock "false") false

        label ( l, _ ) =
            l

        b =
            { label = n
            , node = SSANode LocalEntry (BranchExit (label trueB) (label falseB))
            , body = [ FunctionCall ( "__", boolT ) condFnName [] ]
            , inputs = []
            , symbolsAdded = []
            , symbols = KeepSymbolScope
            }
    in
        ( n, (b :: (List.concatMap Tuple.second [ cond, trueB, falseB ])) )


constant : SymbolType -> Value -> BlocksWithLabel
constant t v =
    ( "CONSTANT"
    , [ { label = "CONSTANT"
        , node = SSANode LocalEntry (ReturnCall ( "__", t ))
        , body = [ Constant ( "__", t ) v ]
        , symbolsAdded = []
        , inputs = []
        , symbols = KeepSymbolScope
        }
      ]
    )



-- SAMPLE CODE
-- ===========


lenVar =
    ( "len", sizeT )


iVar =
    ( "i", sizeT )


sample0 : BlocksWithLabel
sample0 =
    defn "indexOf" [ ( "c", charT ), ( "s", strT ) ] <|
        let_ [ ( lenVar, "strlen" ) ] <|
            loop [ ( iVar, "0" ) ] <|
                if_
                    ( "U64.lt", [] )
                    (constant sizeT "0x00")
                    (constant sizeT "0xffffffff")



--sample2 : Blocks
--sample2 =
--    [   block
--        nDefn
--        PublicEntry
--        (LocalCall "loop.check")
--        [ ( "c", charT ), ( "s", strT ) ]
--        [ Constant ("i", sizeT) "0"
--        , FunctionCall ("len", sizeT) "strlen" ["s"]
--        ]
--
--    , block
--        nStrlen
--        LocalEntry
--        (LocalCall nLoop)
--        [ ("s", strT) ]
--        [ FunctionCall ("len", sizeT) "strlen" ["s"]
--        ]
--    , block
--        nLoop
--        LocalEntry
--        (LocalCall nLoopIf)
--        []
--        [ Constant ("i", sizeT) "0"
--        ]
--
----    , block
----        nLoopIf
----        LocalEntry
----        (BranchExit nCharIf nReturnI)
--
--
--    , block
--        "loop.check"
--        (Phi [ nDefn, "loop.body" ])
--        (BranchExit "loop.body" "loop.done")
--        [ ( "i", sizeT ), ( "len", sizeT ) ]
--        [ BinaryOp ( "inBounds", boolT ) "<" "i" "len"
--        ]
--
--    , block
--        "loop.body"
--        (LocalEntry)
--        (BranchExit "match.true" "match.false")
--        [ ( "i", sizeT ), ( "s", strT ), ( "c", charT ) ]
--        [ BinaryOp ( "current", charT ) "[]" "s" "i"
--        , BinaryOp ( "isMatch", boolT ) "==" "c" "current"
--        ]
--
--    , block
--        "match.true"
--        LocalEntry
--        (LocalCall "loop.inc")
--        []
--        [ Constant ( "_1", sizeT ) "1"
--        , BinaryOp ( "iNext", sizeT ) "+" "i" "_1"
--        ]
--    , block
--        "match.true"
--        LocalEntry
--        (ReturnCall ( "i", sizeT ))
--        [ ( "i", sizeT ) ]
--        []
--    , block
--        "loop.done"
--        LocalEntry
--        (ReturnCall ( "_minus1", sizeT ))
--        []
--        [ Constant ( "_minus1", sizeT ) "-1"
--        ]
--    ]


sample : Blocks
sample =
    --    let
    --        sizeT =
    --            UnsignedIntegral Bits64
    --
    --        char =
    --            ConstType (SignedIntegral Bits8)
    --
    --        str =
    --            (PointerType char)
    --
    --        bool =
    --            SignedIntegral Bits1
    --    in
    --        -- =============================
    --        --        List.append
    Tuple.second sample0
