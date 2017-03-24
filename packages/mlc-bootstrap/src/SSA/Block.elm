{-

Blocks
-------

<Describe me if possible...>

-}
module SSA.Block exposing (..)

import SSA.SSAForm exposing (Block, Blocks, SSANode, SSANodeEntry(..), SSANodeExit(..), SymbolScope(..))



-- we can merge two nodes if a calls b with a LocalCall, b only
-- enters locally and the symbol scope is kept the same
canMerge : Block -> Block  -> Bool
canMerge a b =
    case (a.node.exit, b.node.entry, b.symbols) of
        (LocalCall tgt, LocalEntry, KeepSymbolScope) -> tgt == b.label
        _ -> False

-- merges two blocks
mergeBlockPair : Block -> Block  -> Block
mergeBlockPair head last =
    { label = head.label
    , inputs = head.inputs ++ last.inputs
    , body = head.body ++ last.body
    , node = SSANode head.node.entry last.node.exit
    , symbolsAdded = head.symbolsAdded ++ last.symbolsAdded
    , symbols = head.symbols
    }



-- merges a list of blocks
mergeBlocks : Blocks -> Blocks
mergeBlocks bs =
    case bs of
        [] -> []
        x :: xs ->
            [ List.foldl (\b m -> mergeBlockPair m b) x xs ]




--fold : (a, Block) -> Blocks -> Blocks
--fold b =
--    b
