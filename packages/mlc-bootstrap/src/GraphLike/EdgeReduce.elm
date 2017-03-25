{-

EdgeReduce
-------

<Describe me if possible...>

-}
module GraphLike.EdgeReduce exposing (foldNodes)

import Dict exposing (Dict)
import GraphLike.Types exposing (GraphLike, Node)
import List.Extra
import Set exposing (Set)




{-
    Folds a node with the input and output label list
-}
type alias FoldNode comparable v s = List comparable -> Node comparable v  -> List comparable -> s -> s


--{-
--    Folds a single endge into the state
---}
--type alias ReduceEdge comparable v s = Node comparable v -> Node comparable v -> s -> s
--{-
--    When the reduce encounters a node with multiple outputs, this function is used
--    to create a new state for each outgoing branch.
---}
--type alias SplitState comparable v s = Node comparable v -> List (Node comparable v) -> s -> List s
--{-
--    When the reduce encounters a node with multiple inputs, this function is used
--    to create a new state from the incoming branches
---}
--type alias MergeStates comparable v s = List (Node comparable v) -> Node comparable v -> List s -> s
--
--type alias StartLabel comparable = comparable
--type alias VisitedEdges comparable = Set (comparable, comparable)
--

type alias NodeWithEdges comparable v = (List comparable, Node comparable v, List comparable)

incomingEdges : GraphLike comparable v -> Dict comparable (List comparable)
incomingEdges g =
    let
        baseDict : Dict comparable (List comparable)
        baseDict =
            Dict.map (\_ _ -> []) g.edges

        updateIncomingEdges : comparable -> Maybe (List comparable) -> Maybe (List comparable)
        updateIncomingEdges e =
            Maybe.map ((::) e)

        addIncomingEdge : comparable -> comparable -> Dict comparable (List comparable) -> Dict  comparable (List comparable)
        addIncomingEdge k e =
            Dict.update e (updateIncomingEdges k)

        addToIncomingEdges : comparable -> List comparable -> Dict comparable (List comparable) -> Dict comparable (List comparable)
        addToIncomingEdges k v s =
           List.foldl (addIncomingEdge k) s v
    in
        -- All incoming edges
        Dict.foldl addToIncomingEdges baseDict g.edges


toNodesWithEdges : GraphLike comparable v -> Dict comparable (NodeWithEdges comparable v)
toNodesWithEdges g =
    let
        incoming : Dict comparable (List comparable)
        incoming =
            incomingEdges g

        entry : comparable -> Maybe (NodeWithEdges comparable v)
        entry k =
            Maybe.map3
                (\edgesIn node edgesOut -> (edgesIn, (k, node), edgesOut))
                (Dict.get k incoming)
                (Dict.get k g.nodes)
                (Dict.get k g.edges)

        foldEntries : comparable -> Dict comparable (NodeWithEdges comparable v) -> Dict comparable (NodeWithEdges comparable v)
        foldEntries k s =
            entry k
                |> Maybe.map (\v -> Dict.insert k v s)
                |> Maybe.withDefault s


    in
        List.foldl foldEntries Dict.empty <| Dict.keys g.nodes




foldNodes : (NodeWithEdges comparable v -> s -> s) -> s -> GraphLike comparable v -> s
foldNodes fn s g =
    let
        ns = toNodesWithEdges g
    in
        List.foldl fn s (Dict.values ns)



--edgeReduce
--    :  ReduceEdge comparable v s
--    -> SplitState comparable v s
--    -> MergeStates comparable v s
--    -> StartLabel comparable
--    -> s
--    -> GraphLike comparable v
--    -> s
--edgeReduce edge split merge k s g =
--    let
--        -- The edges we already visited
--        edgesVisited
--            = Set.empty
--
--
--        lookupDict =
--            toNodesWithEdges g
--
--        lookup k =
--            Dict.get k lookupDict
--
--        applyStep n =
--
--
--
--
--        callFn k v s =
--            Maybe.withDefault s
--                <| lookup k
--
--
----
----        edgesFor k =
----            Dict.get k g.edges
----                |> Maybe.withDefault []
----
----        recursive k s =
----            Dict.get k g.nodes
----                |> Maybe.map (\v -> callFn k v s)
----                |> Maybe.withDefault s
----
----        callFn k v s =
----            let
----                edges = edgesFor k
----
----                splitStates edges =
----                    List.Extra.zip edges (split k edges v s)
----
----                reduced = case edges of
----                    [] -> leaf k v s
----
----                    [e] -> recursive e (single k e v s)
----
----                    _ -> List.map
----                            (\(e,splitS) -> recursive e splitS)
----                            splitStates
----
----            in
----                reduced
--
----            f k v (edgesFor k) s
--
--    in
--        Dict.get k g.nodes
--            |> Maybe.map (\v -> callFn k v s)
--            |> Maybe.withDefault s
