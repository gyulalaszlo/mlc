module Bootstrap exposing (..)

import Dict exposing (Dict)
import Html exposing (Html, div, text, program)
import Html.Attributes exposing (style, type_)
import SSA.SSAForm
import SSA.Main as SSAView
import SSA.SSASample exposing (sample)
import Task


type alias Model =
    { code: String
    , ssa: SSAView.Model
    }

initialModel = { code = "", ssa = SSAView.initialModel }

type Msg
    = Init
    | SSAViewMsg SSAView.Msg


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Init ->
            ssaUpdate (SSAView.Show sample) model
        SSAViewMsg m ->
            ssaUpdate m model


ssaUpdate : SSAView.Msg -> Model -> (Model, Cmd Msg)
ssaUpdate m model =
    let
        (cm, cc) = SSAView.update m model.ssa
    in
        ({model | ssa = cm}, Cmd.map SSAViewMsg cc )



init : ( Model, Cmd Msg )
init =
    ( initialModel, Task.succeed Init |> Task.perform identity )

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


view : Model -> Html Msg
view model =
    let
        css = Html.node "style" [type_ "text/css"]
                  [text """@import url("bootstrap.css");
body {  font-family: "Fira Code", Monaco, Courier New; font-size: 13px; }
table.ssa-table { width: 100%; }
.kind-unknown-td { color: #999; font-size: 0.8em; }

thead .block-header td { border-top: 2px solid #ccc; }
thead .block-header-th th { font-size: 0.8em; color: #999; font-weight: normal; }
thead .block-header h5 { margin:0; padding:3px 5px; backround: #cfc; padding-top:2em; }
thead .block-header .code { color: #aaa; font-weight: normal; }


thead:hover,
tbody:hover { background: #ffe; }
tbody:hover tr:hover td { background: #ff0; }


td.op-code,
td.code { border-top: 1px dotted #dcb; border-left: 3px solid #555; color: #543; font-weight: bold; padding-left: 2em; }

td.op-kind { background: #ccc; color: #999; font-size: 0.8em; }
td.op-name { text-align:right; font-weight: bold; }
td.op-left { text-align: right; }
td.op-op { text-align: center; font-weight: bold; }
td.op-type { font-style: italic; color: #765; }


tbody tr.block-input td { background-color: #cfe; }
tbody tr.block-entry td { background-color: #cfc; }
tbody tr.block-exit td { background-color: #efc; }
tbody tr.block-symbols-exported td { background-color: #eff; }
tbody tr.block-symbols-exported td.op-code { color: #aaa; font-weight:normal;}
                  """
                  ]

        split a b =
            Html.table []
                [ Html.tbody []
                    [ Html.tr []
                        [ Html.td [] [a]
                        , Html.td [] [b]
                        ]
                    ]
                ]

     in
        Html.div []
            [   css
            ,   Html.map SSAViewMsg <| SSAView.view model.ssa
            ]



--    case (compile model.code) of
--        Ok c -> codeView c
--        Err e -> Html.ol [] (List.map warningView e)
