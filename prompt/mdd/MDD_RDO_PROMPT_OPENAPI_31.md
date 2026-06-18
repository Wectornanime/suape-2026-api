# Prompt Especializado - OpenAPI 3.1 Compativel com Banco Atual

Gere a especificacao OpenAPI 3.1 da API RDO estritamente com base no schema atual.

## Restricoes obrigatorias
- Nao criar novas tabelas.
- Nao criar novos campos.
- Nao criar novos enums.
- Nao incluir endpoints que dependam de dados inexistentes.

## Recursos permitidos
- `/usuarios`
- `/obras`
- `/rdos`
- `/rdos/{id}`
- `/rdos/{id}/midias`
- `/rdos/{id}/aprovacoes`
- `/rdos/{id}/enviar` (acao de fluxo)

## Schemas permitidos
### Usuario
- id
- nome
- email
- perfil (`FORNECEDOR|FISCAL_EXTERNO|FISCAL_SUAPE|ADMIN`)

### Obra
- id
- nome
- contrato
- endereco

### RDO
- id
- obra_id
- fornecedor_id
- data_rdo
- atividades
- equipe
- equipamentos
- comentarios
- clima
- ocorrencias
- conclusao_etapa
- status (`RASCUNHO|ENVIADO|APROVADO_EXTERNO|APROVADO_SUAPE|REPROVADO`)

### RDOMidia
- id
- rdo_id
- tipo (`FOTO|VIDEO|ANEXO`)
- nome_arquivo
- extensao
- tamanho
- caminho
- descricao
- criado_em

### RDOAprovacao
- id
- rdo_id
- usuario_id
- status (`APROVADO|REPROVADO|DEVOLVIDO`)
- observacao
- criado_em

## Regras de fluxo na especificacao
- `POST /rdos/{id}/enviar`: `RASCUNHO -> ENVIADO`
- `POST /rdos/{id}/aprovacoes`:
  - aprovacao externa pode levar para `APROVADO_EXTERNO` ou `REPROVADO`
  - aprovacao SUAPE pode levar para `APROVADO_SUAPE` ou `REPROVADO`
  - `DEVOLVIDO` deve retornar RDO para `RASCUNHO`

## Entregavel
1. Documento `openapi: 3.1.0` completo em YAML.
2. Componentes e exemplos apenas com campos existentes.
3. Tabela endpoint x perfil autorizado usando `usuarios.perfil`.
4. Checklist final confirmando "sem novos campos".
