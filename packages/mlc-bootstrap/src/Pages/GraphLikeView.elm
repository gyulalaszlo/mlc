{-

GraphLikeView
-------

<Describe me if possible...>

-}
module Pages.GraphLikeView exposing (..)

import Dict
import GraphLike
import GraphLike.EdgeReduce exposing (foldNodes, mapNodesToList)
import Html exposing (Html, div, td, th, text)
import Html.Attributes exposing (class, style)
import SSA.Compile exposing (BlockBase, BlockGraph, BlockNode)
import SSA.InstructionsTable exposing (codeView, instructionsTable, instructionsToString)
import Svg



-- import Html exposing (Html)


graphLikeView : BlockGraph -> Html msg
graphLikeView g =
    let


        node k n =
            Html.tr []
                [ th [ class "graph-node-label" ] [text k ]
                , td [ class "graph-node-value" ] [text (toString n)]
                ]

        edges k =
                List.map
                    (\e ->
                        Html.tr []
                            [ td [] [ text k ]
                            , td [] [ text e ]
                        ])

--        nodeBox : GraphLike.EdgeReduce.NodeWithEdges comparable v -> s -> s

--        nodeBox (is, (l,n), os) =
--           Html.li [] (nodeBase l n os)

    in
        Html.div []
--            [ Html.ul []
--                <| foldNodes (\n s -> s ++ [ nodeBox n ]) [] g
----                (Dict.values <| Dict.map (\k v -> nodebase k v (Html.li [])  << nodeBase) g.nodes)
--
--
--            , Html.table []
--                [ Html.tbody [] (Dict.map node g.nodes |> Dict.values )
--                ]
--            , Html.table []
--                [ Html.tbody [] (Dict.map edges g.edges |> Dict.values |> List.concat )
--                ]

            [ div [ class "nodes"] <| mapNodesToList nodeBase g
            ]




type alias NodeBlocksState msg =
    { left: Float
    , top: Float
    , hStep: Float
    , vStep: Float
    , html: List (Html msg)
    }


--nodeBlock : String -> BlockBase -> List String -> List (Html msg) -> List (Html msg)
--nodeBlock n b es s =
--    s ++ [
--        div [ style [   --("position", "absolute")
--                    --,   ("left", "100px")
--                    ]
--            ]
--            <| nodeBase n b es
--    ]



nodeBase : BlockNode -> Html msg
nodeBase b =
    let
        (ins, (label, node), outs) = b
    in
        div
            [ class "node-base-block" ]
            [ Html.h4 [] [text label]
--            , Html.ul [] <| List.map (\e -> Html.li [] [text e] ) ins
--            , Html.ul [] <| List.map (\e -> Html.li [] [text e] ) outs
    --        , codeView <| instructionsToString b.body
            , instructionsTable b
    --            , Html.p [] [ text <| toString b]
            ]



