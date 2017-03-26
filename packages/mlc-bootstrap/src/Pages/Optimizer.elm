{-

Optimizer
-------

<Describe me if possible...>

-}
module Pages.Optimizer exposing (..)

import Array exposing (Array)
import Html exposing (Html, button, li, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import SSA.Compile exposing (BlockGraph, combineLocalCalls, concatLocalCallBlocks)
import SSA.SSAForm exposing (Blocks)

type Step
    = CombineLocalCalls

type Msg
    = Enable Step
    | Disable Step


type alias Model =
    { shouldCombineLocals: Bool
    }


initialModel : Model
initialModel =
    { shouldCombineLocals = False
    }


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of

        Enable CombineLocalCalls ->
            ({ model | shouldCombineLocals = True }, Cmd.none)

        Disable CombineLocalCalls ->
            ({ model | shouldCombineLocals = False }, Cmd.none)


view : Model -> Html Msg
view model =
    Html.ol
        []
        [ rowView <| combineLocals model

        ]


-- =====================================

runSteps : Model -> BlockGraph -> BlockGraph
runSteps {shouldCombineLocals} g =
    if shouldCombineLocals then
        combineLocalCalls g
    else
        g


-- =====================================


type alias RowModel = (Bool, Step, String)

combineLocals : Model -> RowModel
combineLocals model =
    (model.shouldCombineLocals, CombineLocalCalls, "Combine Locals" )



rowView : RowModel -> Html Msg
rowView (isEnabled, msg, label) =
    li
        [ class  <| if isEnabled then "step-enabled" else "step-disabled"
        , onClick <| if isEnabled then (Disable msg) else (Enable msg)
        ]
        [ text label ]

