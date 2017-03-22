{-

   SSA.Main
   --------

   Main module for SSA view

-}


module SSA.Main exposing (..)

import Codegen.Indented exposing (applyIndents)
import Helpers.Attributes
import Html exposing (Html, div, td, text, tr)
import Html.Attributes exposing (class, colspan, rowspan, style)
import SSA.InstructionsTable exposing (blockView)
import Json.Encode
import SSA.Encode
import SSA.SSAForm as SSAForm exposing (Block, Blocks, Instruction(..), Label, LabelName, SSANode, SSANodeEntry(LocalEntry, Phi), Symbol, SymbolType(..), blockHeaderToString, ssaInstructionsToCode, ssaNodeHeaderToString, ssaTypeToString)


------------------------------------------------------


type Model
    = HasCode Blocks
    | HasNoCode


initialModel =
    HasNoCode


type Msg
    = Show Blocks


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Show blocks ->
            ( HasCode blocks, Cmd.none )


view : Model -> Html Msg
view model =
    case model of
        HasNoCode ->
            Html.text "No SSA code"

        HasCode blocks ->
            Html.div []
                [ instructionsTable blocks
                , jsonView blocks
                ]


instructionsTable : Blocks -> Html msg
instructionsTable b =
    let
        t = List.concatMap blockView b
    in
        Html.table
            [ class "ssa-table"
            , style [ ( "width", "100%" ) ]
            ]
            t





jsonView : Blocks -> Html msg
jsonView b =
    div [class "block-json"]
        [ Html.pre []
            [ Html.code []
                [ text <| Json.Encode.encode 4 <| SSA.Encode.blocks b ]
            ]
        ]
