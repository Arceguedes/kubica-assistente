import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const hook = fileURLToPath(new URL("./bloquear-env.mjs", import.meta.url));

function rodarHook(comando) {
  return spawnSync(process.execPath, [hook], {
    input: JSON.stringify({ tool_input: { command: comando } }),
    encoding: "utf8",
  });
}

const casos = [
  { comando: "cat .env", saida: 2 },
  { comando: "cat .env.example", saida: 0 },
  { comando: "git status", saida: 0 },
  { comando: "grep -r process.env src", saida: 0 },
  { comando: "cat ./.env", saida: 2 },
  { comando: "cat services/vic/.env.local", saida: 2 },
  { comando: "npm run infra:up", saida: 0 },
];

for (const { comando, saida } of casos) {
  test(`"${comando}" -> saida ${saida}`, () => {
    const resultado = rodarHook(comando);
    assert.equal(resultado.status, saida);
    if (saida === 2) {
      assert.match(resultado.stderr, /^Bloqueado: o \.env não pode ser lido/);
    } else {
      assert.equal(resultado.stderr, "");
    }
  });
}
