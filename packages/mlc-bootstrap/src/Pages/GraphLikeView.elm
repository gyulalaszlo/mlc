{-

GraphLikeView
-------

<Describe me if possible...>

-}
module Pages.GraphLikeView exposing (..)

import Dict
import GraphLike
import Html exposing (Html, div, td, text)
import Html.Attributes exposing (class, style)
import SSA.Compile exposing (BlockBase, BlockGraph)
import Svg



-- import Html exposing (Html)


graphLikeView : BlockGraph -> Html msg
graphLikeView g =
    let


        node k n =
            Html.tr []
                [ td [] [text k ]
                , td [] [text (toString n)]
                ]

        edges k =
                List.map
                    (\e ->
                        Html.tr []
                            [ td [] [ text k ]
                            , td [] [ text e ]
                        ])

    in
        Html.div []
            [ Html.table []
                [ Html.tbody [] (Dict.map node g.nodes |> Dict.values )
                ]
            , Html.table []
                [ Html.tbody [] (Dict.map edges g.edges |> Dict.values |> List.concat )
                ]

            , div [ class "nodes"] <| GraphLike.unorderedReduce nodeBlock [] g
            ]




type alias NodeBlocksState msg =
    { left: Float
    , top: Float
    , hStep: Float
    , vStep: Float
    , html: List (Html msg)
    }


nodeBlock : String -> BlockBase -> List String -> List (Html msg) -> List (Html msg)
nodeBlock n b es s =
    s ++ [
        div [ style [   ("position", "absolute")
                    ,   ("left", "100px")
                    ]
            ]
            [ Html.h4 [] [text n]
            , Html.ul [] <| List.map (\e -> Html.li [] [text e] ) es
            , Html.p [] [ text <| toString b]
            ]
    ]
