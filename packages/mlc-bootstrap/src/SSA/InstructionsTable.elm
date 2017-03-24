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
import SSA.SSAForm exposing (..)


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


instructionView : Instruction -> Html msg
instructionView (s,i) =
    let
        opBase ( n, t ) =
            { emptyBlockRow
                | code = instructionsToString [ (s,i) ]
                , name = n
                , type_ = ssaTypeToString t
            }

        b = opBase s

        opData =
            case i of
                BinaryOp o l r ->
                        { b | kind = "BINARY", op = o, left = l, right = r }

                UnaryOp o r ->
                        { b | kind = "UNARY", op = o, right = r }

                Constant  r ->
                        { b | kind = "CONSTANT", right = r }

                FunctionCall c args ->
                        { b | kind = "FN", op = "()", left = c, right = (String.join ", " args) }
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
        [ class "block-header-th" ]
        [ th "op-type" "T"
        , th "op-type" "Type"
        , th "op-name" "Name"
        , th "op-left" "Left"
        , th "op-op" "Op"
        , th "op-right" "Right"
        , th "op-code" ""
        ]
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
        code = String.join "\n" <| applyIndents <| blockHeaderToString b

        phiBaseRow =
            { emptyBlockRow
            | kind = "PHI"
            , klass = "block-entry block-entry-phi"
            }

        phiEntryFrom (n,t) edge =
            { phiBaseRow
            | name = n
            , type_ = ssaTypeToString t
            , op = ">-?"
            , left = edge
            }

        phiEntries s ns =
            {phiBaseRow | code = code } :: List.map (phiEntryFrom s) ns
                |> List.map blockRow


        localEntry =
            tr
                [ class "block-entry block-entry-local" ]
                [ opTd "kind" "LOCAL"
                , td [ colspan 5 ] []
                , td [ class "code" ] [ text code ]
                ]
        globalEntry =
            tr
                [ class "block-entry block-entry-global" ]
                [ opTd "kind" "GLOBAL"
                , td [ colspan 5 ] []
                , td [ class "code" ] [ text code ]
                ]
    in
        case b.node.entry of
            Phi s ns ->
                phiEntries s ns

            LocalEntry ->
                [ localEntry ]

            PublicEntry ->
                [ globalEntry ]


blockExit : Block -> List (Html msg)
blockExit b =
    let
        exitRow kind op left right =
            [ { emptyBlockRow
                | klass = "block-exit block-exit-" ++ kind
                , kind = String.toUpper kind
                , op = op
                , right = right
                , left = left
              }
            ]
    in
        List.map blockRow <|
            case b.node.exit of
                BranchExit t f ->
                    exitRow "branch" "<->" t f

                LocalCall n ->
                    exitRow "local" "->" "" n

                ReturnCall ( n, t ) ->
                    exitRow "return" "RET" "" n

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
        , Html.tbody [] <| List.map blockInput inputs
        , Html.tbody [] <| List.map instructionView body
        , Html.tbody [] <| symbolsAdded b
        , Html.tbody [] <| blockExit b
          --    , Html.thead [] <| blockFooter label node
        ]


codeView : String -> Html msg
codeView c =
    Html.pre [] [ Html.code [] [ text c ] ]
