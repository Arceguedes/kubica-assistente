/**
 * Endereço do Postgres do docker compose (infra/docker-compose.yml).
 * VIC_DATABASE_URL, se existir, vale mais; senão monta a partir de
 * POSTGRES_PASSWORD (e POSTGRES_HOST, que por padrão é localhost).
 */
export function databaseUrl(get: (chave: string) => string | undefined): string {
  const pronta = get('VIC_DATABASE_URL');
  if (pronta) return pronta;

  const senha = get('POSTGRES_PASSWORD');
  if (!senha) {
    throw new Error(
      'Falta POSTGRES_PASSWORD (ou VIC_DATABASE_URL) no .env da raiz',
    );
  }
  const host = get('POSTGRES_HOST') || 'localhost';
  return `postgres://kubica:${encodeURIComponent(senha)}@${host}:5432/kubica`;
}
