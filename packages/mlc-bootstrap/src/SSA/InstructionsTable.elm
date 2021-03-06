{-

   InstructionsTable
   -------

   <Describe me if possible...>

-}


module SSA.InstructionsTable exposing (..)

import Codegen.Indented exposing (applyIndents)
import GraphLike
import GraphLike.EdgeReduce exposing ( mapNodesToList)
import GraphLike.Types exposing (NodeWithEdges)
import Helpers.Attributes
import Html exposing (Html, td, text, tr)
import Html.Attributes exposing (class, colspan, rowspan, style)
import SSA.Compile exposing (BlockBase, BlockGraph, EntryKind(InLocal, InMerge, InPublic), ExitKind(OutBranch, OutLocal, OutReturn))
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


blockHeader : BlockBase -> List (Html msg)
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


blockEntry : List String -> BlockBase -> List (Html msg)
blockEntry ins b =
    let
--        code = String.join "\n" <| applyIndents <| blockHeaderToString b
        code = ""

        phiBaseRow =
            { emptyBlockRow
            | kind = "PHI"
            , klass = "block-entry block-entry-phi"
            }

--        phiEntryFrom (n,t) edge =
        phiEntryFrom edge =
            { phiBaseRow
            | name = ""
            , type_ = "" --ssaTypeToString t
            , op = ">-?"
            , left = edge
            }

        phiEntries  =
            {phiBaseRow | code = code } :: List.map phiEntryFrom ins
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
        case b.entry of
            InMerge ->
                phiEntries

            InLocal ->
                [ localEntry ]

            InPublic ->
                [ globalEntry ]


blockExit : List String ->  BlockBase -> List (Html msg)
blockExit  outs b =
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
            case b.exit of
                OutBranch ->
                    case outs of
                        [t,f] -> exitRow "branch" "<->" t f
                        _ -> []

                OutLocal  ->
                    case outs of
                        [t] -> exitRow "local" "->" "" t
                        _ -> []

                OutReturn  ->
                    exitRow "return" "RET" ""  ""



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


blockView : NodeWithEdges String BlockBase -> List (Html msg)
blockView (ins, (label,b), outs) =
    let
        { body } =
            b
    in
        [ Html.thead [] <| blockHeader b
        , Html.tbody [] <| blockEntry ins b
--        , Html.tbody [] <| List.map blockInput inputs
        , Html.tbody [] <| List.map instructionView body
--        , Html.tbody [] <| symbolsAdded b
        , Html.tbody [] <| blockExit outs b
          --    , Html.thead [] <| blockFooter label node
        ]


codeView : String -> Html msg
codeView c =
    Html.pre [] [ Html.code [] [ text c ] ]

instructionsTable : NodeWithEdges String BlockBase -> Html msg
instructionsTable b =
        Html.table
            [ class "ssa-table"
            , style [ ( "width", "100%" ) ]
            ]
            <| blockView b
