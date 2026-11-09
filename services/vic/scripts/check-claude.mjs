// Confere se as chaves do Claude (VIC e HEX) funcionam, sem gastar crédito (só lista modelos).
// Nunca imprime a chave.
import Anthropic from '@anthropic-ai/sdk';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Mesmo cálculo do src/config/env-path.ts: sobe até achar o .env.example.
function rootEnvPath() {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, '.env.example'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('Raiz do repositório não encontrada.');
    dir = parent;
  }
  return join(dir, '.env');
}

const envPath = rootEnvPath();
if (existsSync(envPath)) process.loadEnvFile(envPath);

let falhou = false;

for (const servico of ['VIC', 'HEX']) {
  const nomeVar = `${servico}_ANTHROPIC_API_KEY`;
  const apiKey = process.env[nomeVar];
  if (!apiKey) {
    console.error(`${servico}: falta ${nomeVar} no .env da raiz`);
    falhou = true;
    continue;
  }
  try {
    const client = new Anthropic({ apiKey });
    await client.models.list();
    console.log(`${servico} OK`);
  } catch (err) {
    // Só a mensagem da API; nunca a chave.
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`${servico}: ${msg.split(apiKey).join('***')}`);
    falhou = true;
  }
}

if (falhou) process.exit(1);
