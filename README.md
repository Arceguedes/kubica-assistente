# kubica-assistente

Monorepo simples (sem npm workspaces) com três projetos NestJS e a infra local.

| Serviço | Pasta          | Porta |
| ------- | -------------- | ----- |
| gateway | `gateway/`     | 3000  |
| vic     | `services/vic` | 3001  |
| hex     | `services/hex` | 3002  |

A porta pode ser sobrescrita com a variável `PORT`.

## Como rodar

```bash
cp .env.example .env          # preencha as chaves
npm run install:all           # instala as dependências dos três projetos

npm run dev:gateway           # http://localhost:3000
npm run dev:vic               # http://localhost:3001
npm run dev:hex               # http://localhost:3002
```

## Webhook local

O gateway recebe o webhook do WhatsApp em `/webhook/whatsapp` (GET para a verificação da Meta, POST para os eventos, com a assinatura `X-Hub-Signature-256` conferida). Por enquanto ele só registra as mensagens e os status no log.

Pré-requisitos: [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) instalado e, no `.env`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_WABA_ID` e `WHATSAPP_API_VERSION` preenchidos.

Em três terminais, nesta ordem:

1. `npm run dev:gateway`: sobe o gateway em http://localhost:3000.
2. `npm run tunnel`: abre um túnel do Cloudflare e mostra uma URL `https://<algo>.trycloudflare.com`.
3. `npm run meta:url -- https://<algo>.trycloudflare.com`: aponta o webhook do WABA para `<url>/webhook/whatsapp` e mostra a inscrição atual.

A URL do túnel muda a cada `npm run tunnel`, então repita o passo 3 sempre que reabrir o túnel. Para só inscrever o app no WABA, sem trocar a URL, use `npm run meta:assinar`.

## Infra local

Postgres (com pgvector), n8n e Ollama rodam via Docker Compose.

1. Copie `.env.example` para `.env` e preencha `POSTGRES_PASSWORD` e `N8N_ENCRYPTION_KEY` (gere cada um com `openssl rand -hex 24`; todos os clones precisam dos mesmos valores).
2. Suba os serviços: `npm run infra:up`
3. Abra o n8n em http://localhost:5678
4. Baixe o modelo de embeddings: `npm run infra:embed`

Outros comandos: `infra:ps`, `infra:logs`, `infra:down`.

> Atenção: `docker compose down -v` apaga os volumes (bancos e dados do n8n). Use `npm run infra:down`, que preserva os dados.
