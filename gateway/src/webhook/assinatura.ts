import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Confere o cabeçalho X-Hub-Signature-256 ("sha256=<hex>") contra o HMAC
 * SHA-256 do corpo cru, usando o App Secret do app da Meta.
 */
export function assinaturaValida(
  corpoCru: Buffer | undefined,
  cabecalho: string | undefined,
  segredo: string | undefined,
): boolean {
  if (!corpoCru || !cabecalho || !segredo) return false;
  if (!cabecalho.startsWith('sha256=')) return false;

  const recebida = Buffer.from(cabecalho.slice('sha256='.length), 'hex');
  const esperada = createHmac('sha256', segredo).update(corpoCru).digest();

  return (
    recebida.length === esperada.length && timingSafeEqual(recebida, esperada)
  );
}
