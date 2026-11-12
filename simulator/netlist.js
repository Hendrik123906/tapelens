// TapeLens netlist builder + simulator.
// Single source of truth for the NAND-netlist encoding used by
// TapeLensVerifier.sol AND the demo frontend. No dependencies, works in
// Node and in the browser (UMD-style export at the bottom).
//
// Encoding (must match the Solidity contract exactly):
//  - gates evaluated in list order; a gate may only reference primary
//    inputs or EARLIER gates (topological order).
//  - node ids: 0..nInputs-1 = primary inputs; nInputs+i = output of gate i.
//  - every gate is a NAND: out = !(a && b).
//  - `outputNodes` lists the node ids of the circuit outputs, in order.
//  - truth table: 2**nInputs rows; row k packs output bits (bit j = output j),
//    input bit i is bit i of k.
//  - canonical hash preimage: abi.encodePacked(uint8 nInputs,
//    uint8 outputNodes.length, gates as uint16be pairs, outputNodes as
//    uint16be). Hash it with keccak256.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TapeLens = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- builder ----------
  function Builder(nInputs) {
    this.nInputs = nInputs;
    this.gates = []; // {a, b} node ids
  }
  Builder.prototype._check = function (ref) {
    var limit = this.nInputs + this.gates.length;
    if (ref < 0 || ref >= limit) throw new Error('Invalid node ref ' + ref + ' (limit ' + limit + ')');
  };
  Builder.prototype.nand = function (a, b) {
    this._check(a); this._check(b);
    this.gates.push({ a: a, b: b });
    return this.nInputs + this.gates.length - 1;
  };
  Builder.prototype.not = function (x) { return this.nand(x, x); };
  Builder.prototype.and = function (a, b) { var n = this.nand(a, b); return this.not(n); };
  Builder.prototype.or = function (a, b) { return this.nand(this.not(a), this.not(b)); };
  Builder.prototype.xor = function (a, b) {
    var n1 = this.nand(a, b);
    var n2 = this.nand(a, n1);
    var n3 = this.nand(b, n1);
    return this.nand(n2, n3);
  };
  Builder.prototype.halfAdder = function (a, b) {
    // Minimal 5-NAND half adder: sum = XOR (4 gates), carry = NOT(NAND) (1).
    var n1 = this.nand(a, b);
    var n2 = this.nand(a, n1);
    var n3 = this.nand(b, n1);
    var sum = this.nand(n2, n3);
    var carry = this.not(n1);
    return { sum: sum, carry: carry };
  };
  Builder.prototype.fullAdder = function (a, b, cin) {
    var h1 = this.halfAdder(a, b);
    var h2 = this.halfAdder(h1.sum, cin);
    return { sum: h2.sum, carry: this.or(h1.carry, h2.carry) };
  };

  // ---------- simulator ----------
  // gates: [{a,b}], nInputs, outputNodes: [nodeId...] -> truth table rows.
  function evaluate(gates, nInputs, outputNodes) {
    if (!gates.length) throw new Error('Empty netlist');
    if (!outputNodes.length) throw new Error('No outputs');
    var combos = 1 << nInputs;
    var total = nInputs + gates.length;
    outputNodes.forEach(function (o) {
      if (o < 0 || o >= total) throw new Error('Invalid output node ' + o);
    });
    var values = new Array(total).fill(0);
    var table = [];
    for (var combo = 0; combo < combos; combo++) {
      for (var i = 0; i < nInputs; i++) values[i] = (combo >> i) & 1;
      for (var g = 0; g < gates.length; g++) {
        var ra = gates[g].a, rb = gates[g].b;
        var limit = nInputs + g;
        if (ra >= limit || rb >= limit) throw new Error('Invalid node ref at gate ' + g);
        values[nInputs + g] = (values[ra] === 1 && values[rb] === 1) ? 0 : 1;
      }
      var row = 0;
      for (var o = 0; o < outputNodes.length; o++) {
        if (values[outputNodes[o]] === 1) row |= (1 << o);
      }
      table.push(row);
    }
    return table;
  }

  // Canonical hash preimage hex ('0x...'). Hash with keccak256.
  function canonicalEncodingHex(gates, nInputs, outputNodes) {
    var bytes = [nInputs, outputNodes.length];
    gates.forEach(function (gt) {
      bytes.push((gt.a >> 8) & 0xff, gt.a & 0xff, (gt.b >> 8) & 0xff, gt.b & 0xff);
    });
    outputNodes.forEach(function (o) {
      bytes.push((o >> 8) & 0xff, o & 0xff);
    });
    return '0x' + bytes.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  // ---------- templates ----------
  // Each template: { id, name, description, nInputs, outputNames,
  //   inputNames[], build() -> {gates, outputs}, reference(combo) -> row }
  var TEMPLATES = [
    {
      id: 'half-adder',
      name: 'Half Adder (1-bit)',
      description: 'Adds two bits. Sum = A XOR B, Carry = A AND B. 5 NAND gates — the smallest useful TapeOut circuit.',
      nInputs: 2, outputNames: ['Sum', 'Carry'],
      inputNames: ['A', 'B'],
      build: function () {
        var b = new Builder(2);
        var h = b.halfAdder(0, 1);
        return { gates: b.gates, outputs: [h.sum, h.carry] };
      },
      reference: function (combo) {
        var a = (combo >> 0) & 1, bb = (combo >> 1) & 1;
        return (a ^ bb) | ((a & bb) << 1);
      }
    },
    {
      id: 'full-adder',
      name: 'Full Adder (1-bit, with carry-in)',
      description: 'Adds A + B + Cin. The building block of every on-chain CPU datapath (like TapeOut\'s Behemoth processor). 13 NAND gates.',
      nInputs: 3, outputNames: ['Sum', 'Carry'],
      inputNames: ['A', 'B', 'Cin'],
      build: function () {
        var b = new Builder(3);
        var f = b.fullAdder(0, 1, 2);
        return { gates: b.gates, outputs: [f.sum, f.carry] };
      },
      reference: function (combo) {
        var a = (combo >> 0) & 1, bb = (combo >> 1) & 1, cin = (combo >> 2) & 1;
        var s = a + bb + cin;
        return (s & 1) | (((s >> 1) & 1) << 1);
      }
    },
    {
      id: 'mux-2to1',
      name: '2-to-1 Multiplexer',
      description: 'Out = Sel ? B : A. The selector block of every CPU datapath. 8 NAND gates.',
      nInputs: 3, outputNames: ['Out'],
      inputNames: ['A', 'B', 'Sel'],
      build: function () {
        var b = new Builder(3);
        var nSel = b.not(2);
        var tA = b.and(0, nSel);
        var tB = b.and(1, 2);
        var out = b.or(tA, tB);
        return { gates: b.gates, outputs: [out] };
      },
      reference: function (combo) {
        var a = (combo >> 0) & 1, bb = (combo >> 1) & 1, s = (combo >> 2) & 1;
        return s ? bb : a;
      }
    },
    {
      id: 'mult-2bit',
      name: '2-bit Multiplier',
      description: 'Multiplies two 2-bit numbers (0–3 × 0–3 = 0–9). 18 NAND gates: 4 ANDs + 2 half adders.',
      nInputs: 4, outputNames: ['P0', 'P1', 'P2', 'P3'],
      inputNames: ['A0', 'A1', 'B0', 'B1'],
      build: function () {
        var b = new Builder(4);
        var p0 = b.and(0, 2); // a0*b0
        var p1 = b.and(0, 3); // a0*b1
        var p2 = b.and(1, 2); // a1*b0
        var p3 = b.and(1, 3); // a1*b1
        var h1 = b.halfAdder(p1, p2);      // -> P1, carry c1
        var h2 = b.halfAdder(p3, h1.carry); // -> P2, P3
        return { gates: b.gates, outputs: [p0, h1.sum, h2.sum, h2.carry] };
      },
      reference: function (combo) {
        var a = ((combo >> 1) & 1) * 2 + ((combo >> 0) & 1);
        var bb = ((combo >> 3) & 1) * 2 + ((combo >> 2) & 1);
        return a * bb; // 4 output bits = product value
      }
    }
  ];

  // SR latch (sequential, LATCH demo — simulated off chain only, NOT
  // verifiable by the on-chain contract which covers combinational logic).
  // Cross-coupled NANDs: Q = NAND(S, Qbar), Qbar = NAND(R, Q).
  function srLatchStep(state, s, r) {
    var q = state.q, qb = state.qb;
    for (var i = 0; i < 10; i++) {
      var nq = (s === 1 && qb === 1) ? 0 : 1;
      var nqb = (r === 1 && q === 1) ? 0 : 1;
      if (nq === q && nqb === qb) break;
      q = nq; qb = nqb;
    }
    return { q: q, qb: qb };
  }

  return {
    Builder: Builder,
    evaluate: evaluate,
    canonicalEncodingHex: canonicalEncodingHex,
    TEMPLATES: TEMPLATES,
    srLatchStep: srLatchStep
  };
});
