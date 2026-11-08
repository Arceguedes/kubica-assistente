// Confere se a chave do Claude funciona, sem gastar crédito (só lista modelos).
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

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Falta ANTHROPIC_API_KEY no .env da raiz');
  process.exit(1);
}

try {
  const client = new Anthropic();
  await client.models.list();
  console.log('Chave do Claude OK');
} catch (err) {
  console.error(err instanceof Error ? err.message : 'Erro desconhecido');
  process.exit(1);
}
