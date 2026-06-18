# Pacote de Prompts MDD - RDO SUAPE (Schema Atual)

Este pacote foi revisado para ser 100% compativel com o banco informado.

## Regra fixa
- Nao criar tabelas novas.
- Nao criar campos novos.
- Nao alterar enums existentes.

## Arquivos
- `MDD_RDO_ANALISE_COMPLETA.md`
  - Analise MDD consolidada com dominio, regras, dados e API compativeis.

- `MDD_RDO_PROMPT_MASTER.md`
  - Prompt principal para conduzir modelagem iterativa sem extrapolar o schema.

- `MDD_RDO_PROMPT_OPENAPI_31.md`
  - Prompt para gerar contrato OpenAPI 3.1 apenas com colunas e enums existentes.

## Ordem recomendada
1. Executar o prompt master.
2. Validar fluxo de status e aprovacoes com negocio.
3. Executar prompt OpenAPI 3.1.
4. Revisar checklist de compatibilidade no final.
