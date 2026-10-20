const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

test("npm start executa o fluxo completo e imprime o resumo esperado", () => {
  const entry = path.join(__dirname, "..", "src", "index.js");
  const stdout = execFileSync(process.execPath, [entry], { encoding: "utf8" });

  assert.match(stdout, /\[INFO\] Iniciando processamento do pedido o1001\./);
  assert.match(stdout, /Resumo do pedido/);
  assert.match(stdout, /Subtotal: R\$ 6440\.00/);
  assert.match(stdout, /Desconto: R\$ 1159\.20/);
  assert.match(stdout, /Frete: R\$ 30\.00/);
  assert.match(stdout, /Taxas: R\$ 161\.00/);
  assert.match(stdout, /Total: R\$ 5471\.80/);
  assert.match(stdout, /"status": "confirmed"/);
});
