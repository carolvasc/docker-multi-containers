# Docker Multi-Containers

Projeto de estudo para orquestrar multi containers com Docker, validar com CI no GitHub Actions e fazer deploy em Render + Cloud Run.

## Visao Geral

Servicos principais:
- client (React)
- api (Node/Express)
- nginx (gateway/reverse proxy)
- postgres
- redis (dev/local)
- worker (Node, processamento assíncrono)

Em producao:
- Render (Blueprint) para client/api/nginx/postgres/redis
- Cloud Run para o worker (plano free)
- Upstash para Redis publico (necessario para o worker rodando fora do Render)

## Arquitetura (producao)

1) client -> nginx -> api
2) api grava no Postgres e publica evento no Redis (Upstash)
3) worker (Cloud Run) consome do Redis e calcula Fibonacci
4) client consulta /api/values/current para ver os resultados

## CI (GitHub Actions)

Workflow: `.github/workflows/ci-docker.yml`
- Builda imagens de client/server/worker/nginx
- Roda testes do client
- Faz push das imagens (se configurado)

## Deploy (Render)

O Render usa `render.yaml` via Blueprint.
No plano free:
- Deploy manual (autoDeploy false)
- Worker nao pode rodar no Render (tipo worker bloqueado)

## Deploy (Cloud Run)

O worker roda como servico no Cloud Run.
Ele precisa expor a porta `PORT` para ficar healthy no Cloud Run.

## Variaveis de ambiente (producao)

Render (api):
- `REDIS_URL`: `rediss://:<PASSWORD>@<UPSTASH_HOST>:6379`
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` (via Render)

Render (client):
- `API_URL`: `https://<api-service>.onrender.com`

Render (nginx):
- `CLIENT_URL`: `https://<client-service>.onrender.com`
- `API_URL`: `https://<api-service>.onrender.com`

Cloud Run (worker):
- `REDIS_URL`: `rediss://:<PASSWORD>@<UPSTASH_HOST>:6379`

Nao exponha secrets no repo.

## Execucao local

Para dev local com live reload:
```bash
docker compose up --build
```

Observacoes:
- O live reload funciona apenas localmente via volumes.
- Em producao nao existe hot reload.

## Notas

Upstash fornece Redis publico. O REST URL/token nao serve para Pub/Sub,
entao o sistema usa Redis URL (rediss://) para o worker e o api.
