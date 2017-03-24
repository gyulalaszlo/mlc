module SSA.SSAForm exposing (..)

import Dict exposing (Dict)
import Codegen.Indented exposing (Line(..), applyIndents, concatLine, concatStatement)
import SSA.LabeledList exposing (LabeledList)


type alias Name =
    String


type alias Type =
    String


type alias Value =
    String


type alias Operator =
    String


type BitWidth
    = Bits64
    | Bits32
    | Bits16
    | Bits8
    | Bits1
    | Bits0


widthInBits : BitWidth -> Int
widthInBits b =
    case b of
        Bits64 ->
            64

        Bits32 ->
            32

        Bits16 ->
            16

        Bits8 ->
            8

        Bits1 ->
            1

        Bits0 ->
            0


type SymbolType
    = SignedIntegral BitWidth
    | UnsignedIntegral BitWidth
    | StructType String
    | PointerType SymbolType
    | ConstType SymbolType
    | Void


type alias SymbolName =
    Name


type alias Symbol =
    ( SymbolName, SymbolType )



-- Labels
-- ======


type alias LabelMeta =
    { requires : List Symbol
    , jumpsTo : List LabelName
    }


type alias LabelName =
    String


type alias Label =
    LabelName


type Operation
    = OpBinary
    | OpUnary
    | OpConstant
    | OpFunctionCall


type InstructionBody
    = BinaryOp Operator SymbolName SymbolName
    | FunctionCall SymbolName (List SymbolName)
    | UnaryOp Operator SymbolName
    | Constant Value



-- Conditional branching
-- Branch someBoolean trueBranchLabel falseBranchLabel
--    | Branch SymbolName LabelName LabelName
--    | Jump LabelName
--    | Return SymbolName
--    | Parameter Symbol

type alias Instruction = (Symbol, InstructionBody)
type alias InstructionList = List Instruction

type alias Block =
    { label : Label
    , inputs : List Symbol
    , body : InstructionList
    , node : SSANode
    , symbolsAdded : List Symbol
    , symbols : SymbolScope
    }


type alias Blocks =
    List Block


type alias BlocksWithLabel =
    LabeledList String Block



--    ( String, Blocks )


type alias NodeName =
    String


type
    SSANodeEntry
    -- A node where the incoming edges are combined
    -- so the optimizer can combine them with relative
    -- ease
    = Phi Symbol (List NodeName)
    | LocalEntry
    | PublicEntry


type
    SSANodeExit
    -- A node where control diverges
    = BranchExit NodeName NodeName
      -- call a node in the current SSA scope
    | LocalCall NodeName
      -- call outside the current SSA scope
    | RemoteCall NodeName
    | ReturnCall Symbol



-- Potential symbol table operations:


type
    SymbolScope
    -- Opens a new scope with the provided symbols
    = OpenNewWith (List Symbol)
      -- Closes the current scope and exports the given symbols
    | CloseByExporting (List Symbol)
      -- Only read access to the symbol table
    | KeepSymbolScope



{-
   A node in the block graph is defined by the entry and exit proprties
-}


type alias SSANode =
    { entry : SSANodeEntry
    , exit : SSANodeExit
    }


signedIntegralTypeToString : BitWidth -> String
signedIntegralTypeToString w =
    case w of
        Bits0 ->
            "void"

        Bits1 ->
            "boolean"

        Bits8 ->
            "char"

        Bits16 ->
            "i16"

        Bits32 ->
            "i32"

        Bits64 ->
            "i64"


unsignedIntegralTypeToString : BitWidth -> String
unsignedIntegralTypeToString w =
    case w of
        Bits0 ->
            "void"

        Bits1 ->
            "u1"

        Bits8 ->
            "u8"

        Bits16 ->
            "u16"

        Bits32 ->
            "u32"

        Bits64 ->
            "u64"


ssaTypeToString : SymbolType -> String
ssaTypeToString t =
    case t of
        SignedIntegral w ->
            signedIntegralTypeToString w

        UnsignedIntegral w ->
            unsignedIntegralTypeToString w

        StructType s ->
            "struct " ++ s

        ConstType c ->
            "const " ++ ssaTypeToString c

        PointerType p ->
            ssaTypeToString p ++ "*"

        Void ->
            "void"


ssaEntryToString : SSANodeEntry -> String
ssaEntryToString e =
    case e of
        Phi s i ->
            "phi"

        LocalEntry ->
            "local"

        PublicEntry ->
            "public"


ssaNodeHeaderToString : Label -> SSANode -> List Line
ssaNodeHeaderToString name { entry, exit } =
    [ Text <| ssaEntryToString entry ++ " " ++ name ]


blockHeaderToString : Block -> List Line
blockHeaderToString { label, node, inputs } =
    let
        args =
            String.join " -> " <| List.map (\( name, t ) -> ssaTypeToString t ++ " " ++ name) inputs
    in
        [ Text <| ssaEntryToString node.entry ++ "  " ++ label ++ ": " ++ args ]


ssaInstructionsToCode : InstructionList -> List Line
ssaInstructionsToCode i =
    -- 1. figure out blocks needed (jump chain)
    let
        targetToString ( name, t ) =
            (ssaTypeToString t) ++ " " ++ name

        assignToString s e =
            concatStatement [ targetToString s, " = ", e ]

        instructionToString : Instruction -> List Line
        instructionToString (s,i) =
            case i of
                BinaryOp op l r ->
                    assignToString s (l ++ " " ++ op ++ " " ++ r)

                UnaryOp op l ->
                    assignToString s (op ++ l)

                Constant v ->
                    assignToString s v

                FunctionCall c args ->
                    assignToString s (c ++ "(" ++ String.join ", " args ++ ")")
    in
        List.concatMap instructionToString i


ssaBlocksToCode : List Block -> List Line
ssaBlocksToCode =
    let
        blockWithLabel b =
            List.append (blockHeaderToString b) (ssaInstructionsToCode b.body)
    in
        List.concatMap blockWithLabel


sizeT =
    UnsignedIntegral Bits64


char =
    ConstType (SignedIntegral Bits8)


str =
    (PointerType char)


bool =
    SignedIntegral Bits1



--block1 =
--    [ Constant ( "i", sizeT ) "0"
--      -- Constant string
--    , Constant ( "s", str ) "Hello world"
--      -- Call strlen
--    , FunctionCall
--        ( "length", sizeT )
--        "strlen"
--        [ "s0" ]
--      --    , Jump "iIsLessThenLengthHeader"
--    ]
