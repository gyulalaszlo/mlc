{-

   SSASample
   -------

   <Describe me if possible...>

-}


module SSA.SSASample exposing (sample)

import Dict
import SSA.LabeledList as LabeledList exposing (label)
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
    Just ( l, b )


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



-- MACROS
-- ======

blocksFrom : Blocks -> BlocksWithLabel
blocksFrom b =
    LabeledList.from .label b


wrap : (SSANodeExit -> BlocksWithLabel) -> BlocksWithLabel -> BlocksWithLabel
wrap f b =
    let
        exitType =
            LabeledList.label b
                |> Maybe.map LocalCall
                |> Maybe.withDefault (ReturnCall ( "", Void ))
    in
        LabeledList.concat [f exitType, b]


type alias Binding =
    ( Symbol, Value )


withBindings : String -> SSANodeEntry -> List Binding -> BlocksWithLabel -> BlocksWithLabel
withBindings blockName entry binds =
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
                        List.map (\( s, v ) -> (s, Constant v)) binds
                        -- metadata about the kind of node this block is
                  , node = SSANode entry exitType
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
    withBindings "let" LocalEntry


loop : List ( Symbol, Value ) -> BlocksWithLabel -> BlocksWithLabel
loop =
    withBindings "loop" (Phi ("i", sizeT) ["A", "B"])


if_ : BlocksWithLabel -> BlocksWithLabel -> BlocksWithLabel -> BlocksWithLabel
if_ cond true false =
    let
        n =
            "if"

        node =
            Maybe.map2
                (\t f -> SSANode LocalEntry (BranchExit t f))
                (label true)
                (label false)
                |> Maybe.withDefault (SSANode LocalEntry (ReturnCall ( "<ERROR>", Void )))

        b = blocksFrom
            [{ label = n
            , node = node
            , body = [ ]
            , inputs = []
            , symbolsAdded = []
            , symbols = KeepSymbolScope
            }]

    in
        LabeledList.concat [ cond, b, true, false ]



constant : SymbolType -> Value -> BlocksWithLabel
constant t v =
    blocksFrom
        [ { label = "CONSTANT:" ++ toString v
            , node = SSANode LocalEntry (ReturnCall ( "__", t ))
            , body = [ ( ( "__", t ), Constant  v) ]
            , symbolsAdded = []
            , inputs = []
            , symbols = KeepSymbolScope
            }
          ]



-- SAMPLE CODE
-- ===========


lenVar =
    ( "len", sizeT )


iVar =
    ( "i", sizeT )


lenCheck : BlocksWithLabel
lenCheck =
    blocksFrom
        [   { label = toString "i < len"
            , node = SSANode LocalEntry (LocalCall "if")
            , body = [(("__", boolT), FunctionCall  "U64.lt" ["i", "len"]) ]
            , symbolsAdded = []
            , inputs = []
            , symbols = KeepSymbolScope
            }]

sample0 : BlocksWithLabel
sample0 =
    defn "indexOf" [ ( "c", charT ), ( "s", strT ) ] <|
        let_ [ ( lenVar, "strlen" ) ] <|
            loop [ ( iVar, "0" ) ] <|
                if_
                    lenCheck
                    (constant sizeT "0x00")
                    (constant sizeT "0xffffffff")


sample : Blocks
sample =
    Maybe.map (\( l, n ) -> n) sample0
        |> Maybe.withDefault []
