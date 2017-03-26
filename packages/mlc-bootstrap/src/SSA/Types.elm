{-

Types
-------

<Describe me if possible...>

-}
module SSA.Types exposing (..)

-- import Html exposing (Html)


type SSAEdgeType tag
    = Local
    | Public
    | Merge tag
    | Split tag

type alias SSAEdge k tag =
    { from: k
    , to: k
    , kind: SSAEdgeType tag
    }

type alias SSAGraph k tag=
    { edges: List (SSAEdge k tag)
    }



