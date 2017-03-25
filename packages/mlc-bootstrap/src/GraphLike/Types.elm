{-

Types
-------

<Describe me if possible...>

-}
module GraphLike.Types exposing (GraphLike, Node)

import Dict exposing (Dict)


-- import Html exposing (Html)


type alias GraphLike comparable v =
    { edges : Dict comparable (List comparable)
    , nodes: Dict comparable v
    }

type alias Node comparable v = (comparable, v)
