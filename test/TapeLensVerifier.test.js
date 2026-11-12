const { expect } = require("chai");
const { ethers } = require("hardhat");
const TapeLens = require("../simulator/netlist");

describe("TapeLensVerifier", function () {
  let verifier;

  before(async function () {
    const Factory = await ethers.getContractFactory("TapeLensVerifier");
    verifier = await Factory.deploy();
    await verifier.waitForDeployment();
  });

  for (const t of TapeLens.TEMPLATES) {
    describe(t.id, function () {
      it("JS simulator matches the independent reference truth table", function () {
        const { gates, outputs } = t.build();
        const expected = [];
        for (let k = 0; k < 1 << t.nInputs; k++) expected.push(t.reference(k));
        expect(TapeLens.evaluate(gates, t.nInputs, outputs)).to.deep.equal(expected);
      });

      it("on-chain evaluate matches the reference truth table", async function () {
        const { gates, outputs } = t.build();
        const gateStructs = gates.map((g) => [g.a, g.b]);
        const expected = [];
        for (let k = 0; k < 1 << t.nInputs; k++) expected.push(t.reference(k));
        const expectedBytes =
          "0x" + expected.map((b) => b.toString(16).padStart(2, "0")).join("");
        expect(await verifier.evaluate(gateStructs, t.nInputs, outputs)).to.equal(
          expectedBytes
        );
      });

      it("JS canonical hash equals the on-chain computeHash", async function () {
        const { gates, outputs } = t.build();
        const gateStructs = gates.map((g) => [g.a, g.b]);
        const enc = TapeLens.canonicalEncodingHex(gates, t.nInputs, outputs);
        const jsHash = ethers.keccak256(enc);
        expect(await verifier.computeHash(gateStructs, t.nInputs, outputs)).to.equal(
          jsHash
        );
      });

      it("verify() succeeds and records the netlist as verified", async function () {
        const { gates, outputs } = t.build();
        const gateStructs = gates.map((g) => [g.a, g.b]);
        const expected = [];
        for (let k = 0; k < 1 << t.nInputs; k++) expected.push(t.reference(k));
        const expectedBytes =
          "0x" + expected.map((b) => b.toString(16).padStart(2, "0")).join("");
        const hash = ethers.keccak256(
          TapeLens.canonicalEncodingHex(gates, t.nInputs, outputs)
        );
        await expect(verifier.verify(hash, gateStructs, t.nInputs, outputs, expectedBytes))
          .to.emit(verifier, "CircuitVerified")
          .withArgs(hash, (await ethers.getSigners())[0].address, gates.length, t.nInputs, outputs.length);
        expect(await verifier.verified(hash)).to.equal(true);
      });

      it("verify() reverts on a tampered truth table", async function () {
        const { gates, outputs } = t.build();
        // Append a redundant double-NOT pair (identity) so this netlist has
        // a FRESH hash, independent of the earlier successful verify() test.
        const out0 = outputs[0];
        const g1 = t.nInputs + gates.length; // node id of first appended gate
        const freshGates = gates.concat([
          { a: out0, b: out0 },
          { a: g1, b: g1 },
        ]);
        const gateStructs = freshGates.map((g) => [g.a, g.b]);
        const expected = [];
        for (let k = 0; k < 1 << t.nInputs; k++) expected.push(t.reference(k));
        expected[0] = expected[0] ^ 1; // flip one row
        const expectedBytes =
          "0x" + expected.map((b) => b.toString(16).padStart(2, "0")).join("");
        const hash = ethers.keccak256(
          TapeLens.canonicalEncodingHex(freshGates, t.nInputs, outputs)
        );
        await expect(
          verifier.verify(hash, gateStructs, t.nInputs, outputs, expectedBytes)
        ).to.be.revertedWithCustomError(verifier, "TruthTableMismatch");
        expect(await verifier.verified(hash)).to.equal(false);
      });
    });
  }

  it("reverts on a wrong netlist hash", async function () {
    const t = TapeLens.TEMPLATES[0];
    const { gates, outputs } = t.build();
    const gateStructs = gates.map((g) => [g.a, g.b]);
    const expected = [];
    for (let k = 0; k < 1 << t.nInputs; k++) expected.push(t.reference(k));
    const expectedBytes =
      "0x" + expected.map((b) => b.toString(16).padStart(2, "0")).join("");
    await expect(
      verifier.verify(ethers.ZeroHash, gateStructs, t.nInputs, outputs, expectedBytes)
    ).to.be.revertedWithCustomError(verifier, "HashMismatch");
  });

  it("reverts on a forward gate reference", async function () {
    const gates = [
      [0, 1],
      [4, 0], // gate 1 referencing gate 2 (not built yet)
    ];
    await expect(verifier.evaluate(gates, 2, [3])).to.be.revertedWithCustomError(
      verifier,
      "InvalidNodeReference"
    );
  });

  it("reverts on an out-of-range output node", async function () {
    const gates = [[0, 1]];
    await expect(verifier.evaluate(gates, 2, [99])).to.be.revertedWithCustomError(
      verifier,
      "InvalidOutputNode"
    );
  });

  it("reverts on an empty netlist", async function () {
    await expect(verifier.evaluate([], 2, [2])).to.be.revertedWithCustomError(
      verifier,
      "EmptyNetlist"
    );
  });
});
