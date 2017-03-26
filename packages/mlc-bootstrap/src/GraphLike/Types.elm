{-

Types
-------

<Describe me if possible...>

-}
module GraphLike.Types exposing (..)

import Dict exposing (Dict)


-- import Html exposing (Html)


type alias GraphLike comparable v =
    { edges : Dict comparable (List comparable)
    , nodes: Dict comparable v
    }

type alias Node comparable v = (comparable, v)
{-
    Folds a node with the input and output label list
-}
type alias FoldNode comparable v s = List comparable -> Node comparable v  -> List comparable -> s -> s

type alias NodeWithEdges comparable v = (List comparable, Node comparable v, List comparable)
