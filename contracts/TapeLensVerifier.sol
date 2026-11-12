// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TapeLensVerifier
/// @notice On-chain truth-table verifier for TapeOut NAND netlists (X Layer).
///
/// A TapeOut circuit is a netlist of NAND gates (plus LATCH state cells).
/// Buying or mining a Circuit NFT today is blind: nothing on chain proves
/// what logic the circuit actually implements. TapeLens fixes that for
/// combinational circuits: anyone can submit a circuit's NAND netlist plus
/// its claimed truth table, and this contract re-evaluates the netlist for
/// EVERY input combination on chain. If it matches, the netlist hash is
/// recorded as VERIFIED; marketplaces, PoD miners and buyers can check it
/// with one read call.
///
/// Netlist encoding (shared with the off-chain simulator):
///  - gates are evaluated in list order (topological: a gate may only
///    reference primary inputs or EARLIER gates).
///  - node ids: 0 .. nInputs-1 are the primary inputs;
///    nInputs+i is the output of gate i.
///  - each gate is a NAND of its two referenced nodes: out = !(a && b).
///  - `outputNodes` lists the node ids of the circuit outputs, in order.
///  - expected truth table: 2**nInputs rows; row k packs the output bits
///    for input combination k (bit j = output j, input bit i is bit i of k).
///  - netlist hash: keccak256 over the canonical byte packing
///    [nInputs, outputNodes.length, (gate.a, gate.b as uint16be) * N,
///     outputNodes as uint16be]. The contract recomputes it, so a netlist
///    can never be verified under a wrong hash.
///
/// Sequential logic (LATCH cells) is intentionally out of scope for the
/// on-chain verifier: it needs clock steps, which the off-chain simulator
/// covers instead. The contract is pure verification logic: no funds, no
/// owner, no upgradeability, no token.
contract TapeLensVerifier {
    struct Gate {
        uint16 a;
        uint16 b;
    }

    /// @notice netlistHash => verified or not.
    mapping(bytes32 => bool) public verified;

    /// @notice Emitted when a netlist is proven correct on chain.
    event CircuitVerified(
        bytes32 indexed netlistHash,
        address indexed submitter,
        uint16 gateCount,
        uint8 nInputs,
        uint8 nOutputs
    );

    error EmptyNetlist();
    error TooManyInputs();
    error TooManyOutputs();
    error BadTruthTableLength();
    error InvalidNodeReference(uint16 ref, uint16 gateIndex);
    error InvalidOutputNode(uint16 ref);
    error TruthTableMismatch(uint256 inputCombination);
    error HashMismatch(bytes32 expected, bytes32 provided);

    uint8 public constant MAX_INPUTS = 4;
    uint8 public constant MAX_OUTPUTS = 4;
    uint256 public constant MAX_GATES = 512;

    /// @notice Canonical hash of a netlist. Anyone can recompute it off chain.
    /// Preimage (matches the JS simulator byte-for-byte):
    ///   [nInputs, outputNodes.length, (gate.a hi, gate.a lo,
    ///    gate.b hi, gate.b lo) * gates.length, (node hi, node lo) * outputs]
    function computeHash(
        Gate[] calldata gates,
        uint8 nInputs,
        uint16[] calldata outputNodes
    ) public pure returns (bytes32) {
        bytes memory packed = new bytes(2 + gates.length * 4 + outputNodes.length * 2);
        packed[0] = bytes1(nInputs);
        packed[1] = bytes1(uint8(outputNodes.length));
        uint256 p = 2;
        for (uint256 i; i < gates.length; i++) {
            packed[p++] = bytes1(uint8(gates[i].a >> 8));
            packed[p++] = bytes1(uint8(gates[i].a));
            packed[p++] = bytes1(uint8(gates[i].b >> 8));
            packed[p++] = bytes1(uint8(gates[i].b));
        }
        for (uint256 o; o < outputNodes.length; o++) {
            packed[p++] = bytes1(uint8(outputNodes[o] >> 8));
            packed[p++] = bytes1(uint8(outputNodes[o]));
        }
        return keccak256(packed);
    }

    /// @notice Evaluate a netlist for every input combination.
    /// @return truthTable 2**nInputs rows, row k packs the output bits.
    function evaluate(
        Gate[] calldata gates,
        uint8 nInputs,
        uint16[] calldata outputNodes
    ) public pure returns (bytes memory truthTable) {
        if (gates.length == 0) revert EmptyNetlist();
        if (nInputs == 0 || nInputs > MAX_INPUTS) revert TooManyInputs();
        if (outputNodes.length == 0 || outputNodes.length > MAX_OUTPUTS) revert TooManyOutputs();
        if (gates.length > MAX_GATES) revert EmptyNetlist();
        uint256 totalNodes = uint256(nInputs) + gates.length;
        for (uint256 o; o < outputNodes.length; o++) {
            if (outputNodes[o] >= totalNodes) revert InvalidOutputNode(outputNodes[o]);
        }

        uint256 combinations = 1 << nInputs;
        truthTable = new bytes(combinations);
        uint8[] memory values = new uint8[](totalNodes);

        for (uint256 combo; combo < combinations; combo++) {
            for (uint8 i; i < nInputs; i++) {
                values[i] = uint8((combo >> i) & 1);
            }
            for (uint256 g; g < gates.length; g++) {
                uint16 ra = gates[g].a;
                uint16 rb = gates[g].b;
                uint256 limit = uint256(nInputs) + g;
                if (ra >= limit || rb >= limit) {
                    revert InvalidNodeReference(ra >= limit ? ra : rb, uint16(g));
                }
                uint8 out = (values[ra] == 1 && values[rb] == 1) ? 0 : 1;
                values[uint256(nInputs) + g] = out;
            }
            uint8 row;
            for (uint256 o; o < outputNodes.length; o++) {
                if (values[outputNodes[o]] == 1) {
                    row |= uint8(1 << o);
                }
            }
            truthTable[combo] = bytes1(row);
        }
    }

    /// @notice Verify a netlist against its claimed truth table and record it.
    /// @dev Reverts unless the netlist evaluates exactly to `expected` for
    ///      every input combination AND netlistHash matches computeHash.
    function verify(
        bytes32 netlistHash,
        Gate[] calldata gates,
        uint8 nInputs,
        uint16[] calldata outputNodes,
        bytes calldata expected
    ) external returns (bool) {
        bytes32 actualHash = computeHash(gates, nInputs, outputNodes);
        if (actualHash != netlistHash) {
            revert HashMismatch(actualHash, netlistHash);
        }
        uint256 combinations = 1 << nInputs;
        if (expected.length != combinations) revert BadTruthTableLength();

        bytes memory actual = evaluate(gates, nInputs, outputNodes);
        for (uint256 combo; combo < combinations; combo++) {
            if (actual[combo] != expected[combo]) {
                revert TruthTableMismatch(combo);
            }
        }
        verified[netlistHash] = true;
        emit CircuitVerified(
            netlistHash,
            msg.sender,
            uint16(gates.length),
            nInputs,
            uint8(outputNodes.length)
        );
        return true;
    }
}
