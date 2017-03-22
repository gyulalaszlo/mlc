{-

InstructionsTable
-------

<Describe me if possible...>

-}
module SSA.InstructionsTable exposing (..)

import Codegen.Indented exposing (applyIndents)
import Helpers.Attributes
import Html exposing (Html, td, text, tr)
import Html.Attributes exposing (class, colspan, rowspan, style)
import SSA.SSAForm exposing (Block, Instruction(..), SSANodeEntry(..), SSANodeExit(..), Symbol, SymbolType(..), blockHeaderToString, ssaInstructionsToCode, ssaTypeToString)

-- ======================

type alias BlockRow =
    { kind : String
    , type_ : String
    , name : String
    , left : String
    , op : String
    , right : String
    , code : String
    , klass : String
    }


emptyBlockRow =
    { kind = ""
    , type_ = ""
    , name = ""
    , left = ""
    , op = ""
    , right = ""
    , code = ""
    , klass = ""
    }


blockRow : BlockRow -> Html msg
blockRow { kind, type_, name, left, op, right, code, klass } =
    Html.tr [ class klass ]
        [ opTd "kind" kind
        , opTd "type" type_
        , opTd "name" name
        , opTd "left" left
        , opTd "op" op
        , opTd "right" right
        , opTd "code"
            (if String.length code > 0 then
                code
             else
                ""
            )
        ]

-- ======================

instructionsToString i =
    String.join "\n" <| applyIndents <| ssaInstructionsToCode i

-- ======================

instructionTableRow : Instruction -> String -> String -> SymbolType -> String -> String -> String -> Html msg
instructionTableRow i kind name t op l r =
    let
        b = { emptyBlockRow
            | klass = "instruction-row"
            , kind = kind
            , type_ = ssaTypeToString t
            , name = name
            , left = l
            , right = r
            , code = instructionsToString [i]
            }
    in
        blockRow b
--        tr [ class "instruction-row" ]
--            [ td [ class "op-kind" ] [ text kind ]
--            , td [ class "op-type" ] [ text <| ssaTypeToString t ]
--            , td [ class "op-name" ] [ text name ]
--            , td [ class "op-left" ] [ text l ]
--            , td [ class "op-op" ] [ text op ]
--            , td [ class "op-right" ] [ text r ]
--            , td [ class "code" ] [ text <| instructionsToString [ i ] ]
--            ]


instructionView : Instruction -> Html msg
instructionView i =
    let
        opBase (n,t) =
            { emptyBlockRow
            | code = instructionsToString [ i ]
            , name = n
            , type_ = ssaTypeToString t
            }

        opData =
            case i of
                BinaryOp s o l r ->
                    let b = opBase s in { b | kind = "BINARY", op = o, left = l, right = r }
    --                instructionTableRow i "BINARY" n t o l r

                UnaryOp s o r ->
                    let b = opBase s in { b | kind = "UNARY", op = o, right = r }
    --                instructionTableRow i "UNARY" n t o "" r

                Constant s r ->
                    let b = opBase s in { b | kind = "CONSTANT", right = r }
    --                instructionTableRow i "CONSTANT" n t "" "" r

                FunctionCall s c args ->
                    let b = opBase s in { b | kind = "FN", op = "()", right = (String.join ", " args) }

--                    instructionTableRow i "FN" n t "()" c (toString args)
     in
        blockRow opData


headerClassGen =
    Helpers.Attributes.classGen [ "block-header" ]


th c l =
    Html.th [ class <| headerClassGen c ] [ text l ]


opTd : String -> String -> Html msg
opTd klass s =
    td [ class <| "op-" ++ klass ] [ text s ]


blockHeader : Block -> List (Html msg)
blockHeader block =
    [ tr
        [ class "block-header" ]
        [ Html.td [ colspan 6 ]
            [ Html.h5 [] [ text block.label ]
            ]
        , td
            [ class "code"
            , rowspan 2
            ]
            [ codeView <|
                String.join "\n" <|
                    applyIndents <|
                        blockHeaderToString
                            block
            ]
        ]
--    , tr
--        [ class "block-header-th" ]
--        [ th "op-type" "T"
--        , th "op-type" "Type"
--        , th "op-name" "Name"
--        , th "op-left" "Left"
--        , th "op-op" "Op"
--        , th "op-right" "Right"
--        ]
    ]


blockInput : Symbol -> Html msg
blockInput ( n, t ) =
    Html.tr [ class "block-input" ]
        [ td [ class "op-kind" ] [ text "IN" ]
        , td [ class "op-type" ] [ text <| ssaTypeToString t ]
        , td [ class "op-name" ] [ text n ]
        , td [ class "op-left" ] []
        , td [ class "op-op" ] []
        , td [ class "op-right" ] []
        ]


blockEntry : Block -> List (Html msg)
blockEntry b =
    let
        phiEntryFrom n =
            tr
                [ class "block-entry block-entry-phi" ]
                [ opTd "kind" "PHI"
                , opTd "type" ""
                , opTd "name" ""
                , opTd "left" ""
                , opTd "op" ">-?"
                , opTd "right" n
                ]

        localEntry =
            tr
                [ class "block-entry block-entry-local" ]
                [ opTd "kind" "LOCAL"
                , td [ colspan 5 ] []
                ]
    in
        case b.node.entry of
            Phi ns ->
                List.map phiEntryFrom ns

            LocalEntry ->
                [ localEntry ]

            _ ->
                []


blockExit : Block -> List (Html msg)
blockExit b =
    let
        exitRow kind op right =
            [ { emptyBlockRow
                | klass = "block-exit block-exit-" ++ kind
                , kind = String.toUpper kind
                , op = op
                , right = right
              }
            ]
    in
        List.map blockRow <|
            case b.node.exit of
                BranchExit t f ->
                    exitRow "branch" "<->" f

                LocalCall n ->
                    exitRow "local" "->" n

                ReturnCall ( n, t ) ->
                    exitRow "return" "RET" n

                _ ->
                    []



symbolsAdded : Block -> List (Html msg)
symbolsAdded b =
    let
        symbolAdded ( n, t ) =
            blockRow
                { emptyBlockRow
                    | kind = "EXPORT"
                    , type_ = ssaTypeToString t
                    , name = n
                    , code = "export " ++ n ++ ";"
                    , klass = "block-symbols-exported"
                }
    in
        List.map symbolAdded b.symbolsAdded


blockView : Block -> List (Html msg)
blockView b =
    let
        { label, body, node, inputs } =
            b
    in
        [ Html.thead [] <| blockHeader b
        , Html.tbody [] <| blockEntry b
          --        , Html.tbody [] <| List.map blockInput inputs
        , Html.tbody [] <| List.map instructionView body
        , Html.tbody [] <| symbolsAdded b
        , Html.tbody [] <| blockExit b
          --    , Html.thead [] <| blockFooter label node
        ]


codeView : String -> Html msg
codeView c =
    Html.pre [] [ Html.code [] [ text c ] ]
