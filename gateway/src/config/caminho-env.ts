import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Caminho do .env na raiz do repo. Sobe a partir deste arquivo até achar a
 * pasta que tem o .env.example, então funciona tanto em src/ quanto em dist/.
 */
export function caminhoEnvDaRaiz(): string | undefined {
  let pasta = import.meta.dirname;
  for (;;) {
    if (existsSync(join(pasta, '.env.example'))) return join(pasta, '.env');
    const acima = dirname(pasta);
    if (acima === pasta) return undefined;
    pasta = acima;
  }
}
