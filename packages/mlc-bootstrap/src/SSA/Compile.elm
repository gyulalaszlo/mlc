{-

   Compile
   -------

   <Describe me if possible...>

-}


module SSA.Compile exposing (..)

-- import Html exposing (Html)

import GraphLike exposing (GraphLike, mapNodes)
import GraphLike.EdgeReduce exposing ( filterMapNodes, foldNodes)
import GraphLike.Types exposing (NodeWithEdges)
import SSA.Block exposing (canMerge, mergeBlockPair)
import Dict exposing (Dict)
import SSA.SSAForm exposing (..)
import List.Extra exposing (groupWhileTransitively, span, takeWhile)
import Set



{-
   Concatenates strings of  local blocks that exit with a LocalCall
-}

type alias ErrorList = List String

type EntryKind
    = InMerge
    | InLocal
    | InPublic

type ExitKind
    = OutLocal
    | OutBranch
    | OutReturn

type alias NodeBase =
    { entry: EntryKind
    , exit:ExitKind
    , edges: List String
    }


type alias BlockGraph = GraphLike String BlockBase
type alias BlockNode = NodeWithEdges String BlockBase

type alias BlockBase =
    { body: InstructionList
    , symbols: SymbolScope
    , entry: EntryKind
    , exit: ExitKind
    }


decomposeSSANode : SSANode -> NodeBase
decomposeSSANode n =
    let
        entry = case n.entry of
            Phi s l -> InMerge
            LocalEntry -> InLocal
            PublicEntry -> InPublic

        (exit, edges) = case n.exit of
            BranchExit t f -> (OutBranch, [t, f])
            LocalCall n -> (OutLocal, [n])
            RemoteCall n -> (OutLocal, [n])
            ReturnCall (n,t) -> (OutReturn, [])
    in
        (NodeBase entry exit edges)

toGraphLike : Blocks -> BlockGraph
toGraphLike bs =
    let

        addBlock b g =
            let
                n =
                    decomposeSSANode b.node

                block =
                    { body = b.body
                    , symbols = b.symbols
                    , entry = n.entry
                    , exit = n.exit
                    }
            in
                GraphLike.addNode b.label block n.edges g
    in

        List.foldl addBlock GraphLike.empty bs
--type
--
--blocksToGraphLike : Blocks -> GraphLike

combineLocalCalls : BlockGraph -> BlockGraph
combineLocalCalls g =
    let
        combineList : NodeWithEdges String BlockBase -> Maybe (String,String)
        combineList (_, (l,n), outs) =
            let
                combine : String -> BlockBase -> Maybe (String, String)
                combine ol on =
                    case (n.exit, on.entry) of
                        (OutLocal, InLocal) -> Just (l, ol)
                        _ -> Nothing


            in
                -- We can only combine nodes with single in-out connection
                case outs of
                    [ol] ->
                        GraphLike.node ol g
                            |> Maybe.andThen (combine ol)
--                            |> Maybe.map (\(l,r)-> s)
--                            |> Maybe.withDefault s

                    _ -> Nothing


        merged = filterMapNodes combineList g

        froms = Set.fromList <| List.map Tuple.first merged
        tos = Set.fromList <| List.map Tuple.second merged


        isHead (l,r) = not <| Set.member l tos
        isTail (l,r) = not <| Set.member r froms

        (tails, nonTails) = List.partition isTail merged

        init = List.map (\(l,r) -> [l,r]) tails

        mergable r rest path =
            let (m,nm) = List.partition (\(ll, rr) -> ll == r) rest
            in
               List.concatMap (\(l,r) -> mergable r nm <| r :: path) m





    in
        g



concatLocalCallBlocks : Blocks -> Blocks
concatLocalCallBlocks b =
    let

        g = toGraphLike b



        combineList : NodeWithEdges String BlockBase -> Maybe (String, String)
        combineList (_, (l,n), outs) =
            let
                combine : String -> BlockBase -> Maybe (String, String)
                combine ol on =
                    case (n.exit, on.entry) of
                        (OutLocal, InLocal) -> Just (l, ol)
                        _ -> Nothing
            in
                -- We can only combine nodes with single in-out connection
                case outs of
                    [ol] ->
                        GraphLike.node ol g
                            |> Maybe.andThen (combine ol)
                    _ -> Nothing

        -- pick nodes with single strings


        -- get a temporary dict for our needs.
        foldBlocks : Blocks -> Blocks
        foldBlocks bs =
            case bs of
                [] -> []
                -- make sure we have a head
                x :: xs ->
                    let
                        mergeGroups = groupWhileTransitively canMerge bs
                        folder b (bs, tmp) =
                            if canMerge tmp b then
                                (bs, mergeBlockPair tmp b)
                            else
                                (bs ++ [tmp], b)

                        (folded, tmp) = List.foldl folder ([],x) xs
                    in
                        folded ++ [tmp]


    in
        foldBlocks b



