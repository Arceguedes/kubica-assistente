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

## Infra (Postgres + pgvector, n8n, Ollama)

```bash
docker compose --env-file .env -f infra/docker-compose.yml up -d
```
