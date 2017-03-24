{-

   Compile
   -------

   <Describe me if possible...>

-}


module SSA.Compile exposing (..)

-- import Html exposing (Html)

import GraphLike exposing (GraphLike)
import SSA.Block exposing (canMerge, mergeBlockPair)
import Dict exposing (Dict)
import SSA.SSAForm exposing (..)
import List.Extra exposing (groupWhileTransitively, span, takeWhile)


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

{-
    Folds a list as a chain of labeled elements.
    Starting with the head element of the list.

    keyFn:
        returns the label to use for an element

    foldFn:
        folds the state with the current element in the chain and
        returns a pair of the labels for the next step and the
        updated state.

    s:
        initial state



-}


--foldChain : (v -> comparable) -> ( (s,v) -> List (s,v) ) -> ( List (s,v) -> (s,v) ) -> (v -> s -> s) -> s -> List v -> Result comparable s
--foldChain keyFn foldFn init seq =
--    case seq of
--        [] -> Ok init
--        x :: _ ->
--            let
--                dict = Dict.fromList <| List.map (\e -> (keyFn  e, e)) seq
--
----                foldEl : v -> s -> s
----                foldEl e s =
----                    let
----                        (l, newS) = foldFn e s
----                    in
----                        fold l newS
--
--                fold : (comparable, s) -> Result comparable s
--                fold (label,s) =
--                    case Dict.get label dict of
--                        Nothing -> Err label
--                        Just b -> fold <| foldFn b s
--
--            in
--                fold (keyFn x, init)


type alias FoldState = (Blocks, Block)

concatLocalCallBlocks : Blocks -> Blocks
concatLocalCallBlocks b =
    let

        g = toGraphLike b

        -- pick nodes with single strings


        -- get a temporary dict for our needs.
--        blocksDict =
--            Dict.fromList <| List.map (\bl -> (bl.label, bl)) b
--
--        mergableNodes n =
--            case n.node.exit of
--                LocalCall
--        bs =List.filterMap () b


--        foldNext : Block -> FoldState -> (String, FoldState)
--        foldNext b (bs, tmp) =
--            if canMerge tmp b then
--                (bs, mergeBlockPair tmp b)
--            else
--                (bs ++ [tmp], b)

--        c = foldChain .label foldNext

--        foldBlocks : (Block -> FoldState -> (String, FoldState)) -> (String, FoldState) -> Dict String Block


--        -- we can merge two nodes if a calls b with a LocalCall, b only
--        -- enters locally and the symbol scope is kept the same
--        canMerge : Block -> Block  -> Bool
--        canMerge a b =
--            case (a.node.exit, b.node.entry, b.symbols) of
--                (LocalCall _, LocalEntry, KeepSymbolScope) -> True
--                _ -> False
--
--        -- merges two blocks
--        mergeBlockPair : Block -> Block  -> Block
--        mergeBlockPair head last =
--            { label = head.label
--            , inputs = head.inputs ++ last.inputs
--            , body = head.body ++ last.body
--            , node = SSANode head.node.entry last.node.exit
--            , symbolsAdded = head.symbolsAdded ++ last.symbolsAdded
--            , symbols = head.symbols
--            }
--
--
--
--        mergeBlocks : Blocks -> Blocks
--        mergeBlocks bs =
--            case bs of
--                [] -> []
--                x :: xs ->
--                    [ List.foldl (\b m -> mergeBlockPair m b) x xs ]
--
--
--

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
