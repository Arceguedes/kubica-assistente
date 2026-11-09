import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Caminho do .env na raiz do repositório.
 * Sobe as pastas a partir deste arquivo até achar o .env.example, que só
 * existe na raiz. Assim funciona em src/ e em dist/, rodando de qualquer pasta.
 */
export function rootEnvPath(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, '.env.example'))) {
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Raiz do repositório não encontrada (.env.example).');
    }
    dir = parent;
  }
  return join(dir, '.env');
}
