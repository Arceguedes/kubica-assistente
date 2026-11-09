// Aplica os arquivos de migrations/*.sql, em ordem, no Postgres do compose.
// Cada arquivo é idempotente (CREATE ... IF NOT EXISTS). Nunca imprime senhas.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const aqui = dirname(fileURLToPath(import.meta.url));

let raiz = aqui;
while (!existsSync(join(raiz, '.env.example'))) {
  const pai = dirname(raiz);
  if (pai === raiz) throw new Error('Raiz do repositório não encontrada.');
  raiz = pai;
}
const envPath = join(raiz, '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

let url = process.env.VIC_DATABASE_URL;
if (!url) {
  if (!process.env.POSTGRES_PASSWORD) {
    console.error('Falta POSTGRES_PASSWORD (ou VIC_DATABASE_URL) no .env da raiz');
    process.exit(1);
  }
  const host = process.env.POSTGRES_HOST || 'localhost';
  url = `postgres://kubica:${encodeURIComponent(process.env.POSTGRES_PASSWORD)}@${host}:5432/kubica`;
}

const pasta = join(aqui, '..', 'migrations');
const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.sql')).sort();

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  for (const arquivo of arquivos) {
    await client.query(readFileSync(join(pasta, arquivo), 'utf8'));
    console.log(`Migração aplicada: ${arquivo}`);
  }
} catch (err) {
  console.error(`Falha na migração: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
