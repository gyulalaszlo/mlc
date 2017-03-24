{-

   Encode
   -------

   <Describe me if possible...>

-}


module SSA.Encode exposing (..)

-- import Html exposing (Html)

import Json.Encode exposing (array, int, list, object, string)
import SSA.SSAForm as S exposing (..)

type alias Value = Json.Encode.Value

name : Name -> Value
name n =
    string n


operator : Operator -> Value
operator o =
    string o


symbolType : SymbolType -> Value
symbolType s =
    let
        toStr s =
            case s of
                S.SignedIntegral w ->
                    "i " ++ (toString <| widthInBits w)

                S.UnsignedIntegral w ->
                    "u " ++ (toString <| widthInBits w)

                S.StructType n ->
                    "struct " ++ n

                S.PointerType p ->
                    "* " ++ toStr p

                S.ConstType p ->
                    "const " ++ toStr p

                S.Void ->
                    "void"
    in
        string <| toStr s


symbol : Symbol -> Value
symbol ( n, t ) =
    object
        [ ( "name", name n )
        , ( "type", symbolType t )
        ]


instruction : Instruction -> Value
instruction (s,i) =
    case i of
        S.BinaryOp o l r ->
            list [ string "binary", operator o, string l, string r ]

        S.UnaryOp o r ->
            list [ string "unary", operator o, string r ]

        S.FunctionCall n a ->
            list [ string "fn", string n ]

        S.Constant v ->
            list [ string "const" ]


block : Block -> Value
block { label, node, inputs, body } =
    object
        [ ( "label", string label )
        , ( "body", list <| List.map instruction body )
        ]


blocks : Blocks -> Value
blocks b =
    list <| List.map block b
