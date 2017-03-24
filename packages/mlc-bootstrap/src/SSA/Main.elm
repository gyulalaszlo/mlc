{-

   SSA.Main
   --------

   Main module for SSA view

-}


module SSA.Main exposing (..)

import Codegen.Indented exposing (applyIndents)
import Dict
import Html.Events exposing (onClick)
import Pages.GraphLikeView exposing (graphLikeView)
import SSA.Compile exposing (BlockGraph, concatLocalCallBlocks, toGraphLike)
import Helpers.Attributes
import Html exposing (Html, div, td, text, tr)
import Html.Attributes exposing (class, colspan, rowspan, style)
import SSA.InstructionsTable exposing (blockView)
import Json.Encode
import SSA.Encode
import SSA.SSAForm as SSAForm exposing (..)


------------------------------------------------------

type PageShown
    = BlocksView
    | GraphView
    | JsonView


type Code
    = HasCode Blocks
    | HasNoCode

type alias Model =
    { code: Code
    , shown: PageShown
    }


initialModel =
    { code = HasNoCode
    , shown = BlocksView
    }



type Msg
    = Show Blocks
    | ShowPage PageShown



update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Show blocks ->
            ( { model | code =  HasCode blocks }, Cmd.none )

        ShowPage p -> ({ model | shown = p }, Cmd.none )


view : Model -> Html Msg
view {shown, code} =
        case code of
            HasNoCode ->
                Html.text "No SSA code"

            HasCode blocks ->
                Html.div []
                    [ div [ class "json-head" ]
                        [ Html.button [ onClick (ShowPage JsonView) ] [ text "Show JSON" ]
                        , Html.button [ onClick (ShowPage BlocksView) ] [ text "Show Blocks" ]
                        , Html.button [ onClick (ShowPage GraphView) ] [ text "Show Graph" ]
                        ]
                    , pageView shown blocks
                    ]
--                    [ instructionsTable blocks
--                    , Html.h2 [] [ text "concat" ]
--                    , Html.hr [] []
--                    , instructionsTable <| concatLocalCallBlocks blocks
--                    , graphLikeView blocks
--                    , jsonView isJsonShown blocks
--                    ]


pageView : PageShown -> Blocks -> Html Msg
pageView s bs =
    case s of
        JsonView -> jsonView bs
        BlocksView ->  instructionsTable bs
        GraphView -> graphLikeView (toGraphLike bs)


instructionsTable : Blocks -> Html msg
instructionsTable b =
    let
        t =
            List.concatMap blockView b
    in
        Html.table
            [ class "ssa-table"
            , style [ ( "width", "100%" ) ]
            ]
            t


jsonView : Blocks -> Html Msg
jsonView  b =
        div [ class "block-json" ]
            [ Html.pre []
                [ Html.code []
                    [ text <| Json.Encode.encode 4 <| SSA.Encode.blocks b ]
                ]
            ]



