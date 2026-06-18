# Backend RDO SUAPE

API REST inicial para o sistema de Diario de Obras (RDO), implementada com Node.js + TypeScript + Express + PostgreSQL.

## Stack
- Node.js
- TypeScript
- Express
- PostgreSQL (`pg`)
- Zod para validacao

## Estrutura
- `src/config`: ambiente e conexao de banco.
- `src/middlewares`: tratamento de erro e RBAC simples.
- `src/routes`: endpoints de usuarios, obras e RDO.
- `src/utils`: utilitarios de erro, async e parse JSON.
- `docs`: documentacao tecnica.

## Requisitos
- Node.js 20+
- PostgreSQL com schema ja criado (tabelas: `usuarios`, `obras`, `rdos`, `rdo_midias`, `rdo_aprovacoes`).

## Configuracao
1. Copiar `.env.example` para `.env`.
2. Ajustar credenciais de banco.
3. Instalar dependencias:
   - `npm install`

## Execucao
- Desenvolvimento: `npm run dev`
- Build: `npm run build`
- Producao: `npm start`

## Docker Compose (backend + Postgres)
No diretorio raiz do repositorio:
- Subir servicos: `docker compose up --build -d`
- Logs do backend: `docker compose logs -f backend`
- Derrubar ambiente: `docker compose down`

O backend sobe na porta `3000` e conecta no servico `postgres` do compose.

## Deploy no Railway
O repositorio ja inclui `railway.toml` apontando para `backend/Dockerfile`.

Passos recomendados:
1. Criar um projeto no Railway e conectar este repositorio.
2. Criar um servico PostgreSQL no Railway.
3. No servico do backend, configurar variaveis:
   - `PORT=3000`
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (referencia da variavel do plugin Postgres)
   - `DB_SSL=true`
   - `DB_CONNECTION_LIMIT=10`
4. Definir Healthcheck Path como `/health` (ja configurado no `railway.toml`).

Com isso, o backend usa `DATABASE_URL` em producao (Railway) e segue suportando variaveis separadas para uso local.

## Headers de autorizacao (MVP)
No estado inicial, as rotas usam RBAC simples por header:
- `x-user-perfil: FORNECEDOR | FISCAL_EXTERNO | FISCAL_SUAPE | ADMIN`

## Endpoints iniciais
- `GET /health`
- `GET /api-docs` (Swagger UI)
- `GET|POST|PUT /api/usuarios`
- `GET|POST|PUT /api/obras`
- `GET|POST|PUT /api/rdos`
- `POST /api/rdos/{id}/enviar`
- `GET|POST /api/rdos/{id}/midias`
- `GET|POST /api/rdos/{id}/aprovacoes`

Veja detalhes em:
- `docs/ENDPOINTS.md`
- `docs/API_OPENAPI.yaml`
- `docs/ARQUITETURA.md`
