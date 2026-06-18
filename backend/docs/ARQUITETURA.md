# Arquitetura Tecnica - Backend RDO SUAPE

## Objetivo
Entregar uma base inicial funcional para cadastro e fluxo basico de RDO, aderente ao schema existente.

## Estilo arquitetural
- API REST em camadas leves.
- Separacao por responsabilidades:
  - Rotas: contrato HTTP e orquestracao.
  - Config: ambiente e acesso ao banco.
  - Middlewares: controle de acesso e erro.
  - Utils: reutilizacao transversal.

## Componentes
- `app.ts`: bootstrap de middlewares e rotas.
- `server.ts`: inicializacao do servidor.
- `config/db.ts`: pool PostgreSQL.
- `routes/*.routes.ts`: regras de endpoint.
- `middlewares/rbac.ts`: autorizacao por perfil via header (MVP).
- `middlewares/error-handler.ts`: padrao unico de erro.

## Fluxo de aprovacao implementado
- Status do RDO: `RASCUNHO`, `ENVIADO`, `APROVADO_EXTERNO`, `APROVADO_SUAPE`, `REPROVADO`.
- Aprovacao externa permitida quando RDO esta `ENVIADO`.
- Aprovacao SUAPE permitida quando RDO esta `APROVADO_EXTERNO`.
- `DEVOLVIDO` em `rdo_aprovacoes` retorna RDO para `RASCUNHO`.

## Decisoes tecnicas
- Sem adicao de tabelas/colunas para manter compatibilidade total com banco atual.
- Campos JSON (`equipe`, `equipamentos`) sao serializados/deserializados na API.
- Validacao de payload com Zod.

## Evolucoes recomendadas
- Substituir header RBAC por JWT real.
- Criar camada de servico/repositorio para casos de uso complexos.
- Adicionar testes automatizados (unitarios e integracao).
- Adicionar migracoes versionadas do banco.
