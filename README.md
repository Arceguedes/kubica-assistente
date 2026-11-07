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

## Infra local

Postgres (com pgvector), n8n e Ollama rodam via Docker Compose.

1. Copie `.env.example` para `.env` e preencha `POSTGRES_PASSWORD` e `N8N_ENCRYPTION_KEY` (gere cada um com `openssl rand -hex 24`; todos os clones precisam dos mesmos valores).
2. Suba os serviços: `npm run infra:up`
3. Abra o n8n em http://localhost:5678
4. Baixe o modelo de embeddings: `npm run infra:embed`

Outros comandos: `infra:ps`, `infra:logs`, `infra:down`.

> Atenção: `docker compose down -v` apaga os volumes (bancos e dados do n8n). Use `npm run infra:down`, que preserva os dados.
