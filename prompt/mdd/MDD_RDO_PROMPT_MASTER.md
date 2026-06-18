# Prompt Master MDD - RDO SUAPE (Compativel com Banco Atual)

Atue como Arquiteto de Software Senior com foco em DDD/MDD e modele a API do RDO sem gerar codigo.

## Restricao obrigatoria
- Use exclusivamente o schema abaixo como fonte de verdade.
- Nao criar novas tabelas.
- Nao criar novos campos.
- Nao alterar enums existentes.

## Schema de referencia
- `usuarios(id, nome, email, perfil)`
- `obras(id, nome, contrato, endereco)`
- `rdos(id, obra_id, fornecedor_id, data_rdo, atividades, equipe, equipamentos, comentarios, clima, ocorrencias, conclusao_etapa, status)`
- `rdo_midias(id, rdo_id, tipo, nome_arquivo, extensao, tamanho, caminho, descricao, criado_em)`
- `rdo_aprovacoes(id, rdo_id, usuario_id, status, observacao, criado_em)`

Enums existentes:
- `usuarios.perfil`: `FORNECEDOR | FISCAL_EXTERNO | FISCAL_SUAPE | ADMIN`
- `rdos.status`: `RASCUNHO | ENVIADO | APROVADO_EXTERNO | APROVADO_SUAPE | REPROVADO`
- `rdo_midias.tipo`: `FOTO | VIDEO | ANEXO`
- `rdo_aprovacoes.status`: `APROVADO | REPROVADO | DEVOLVIDO`

## Etapas obrigatorias

### Etapa 1 - Negocio
- Objetivos do sistema e atores.
- Limites funcionais respeitando o banco atual.

### Etapa 2 - Dominio
- Entidades e relacionamentos apenas com as 5 tabelas.
- Aggregate Root principal: `RDO`.
- ER em Mermaid fiel ao schema.

### Etapa 3 - Regras
- Matriz de permissoes baseada em `usuarios.perfil`.
- Fluxo de status apenas com `rdos.status`.
- Uso de `rdo_aprovacoes.status = DEVOLVIDO` para devolver e retornar RDO para `RASCUNHO`.
- State machine em Mermaid.

### Etapa 4 - Dados
- Documentar exatamente as tabelas e colunas existentes.
- Nao propor campos extras.

### Etapa 5 - Casos de uso
Para cada caso: objetivo, atores, pre-condicoes, fluxo principal, alternativos, pos-condicoes.

### Etapa 6 - API REST
- Endpoints apenas para: `usuarios`, `obras`, `rdos`, `rdos/{id}/midias`, `rdos/{id}/aprovacoes`.
- Requests/responses so com colunas existentes.

### Etapa 7 - Seguranca
- Pode descrever JWT/RBAC em camada de aplicacao, sem dependencia de novos campos.

### Etapa 8 - Offline
- Descrever estrategia operacional sem exigir persistencia nova no banco.

### Etapa 9 - Relatorios
- Relatorios baseados apenas em `rdos`, `rdo_midias`, `rdo_aprovacoes`.

### Etapa 10 - Consolidado final
Entregar:
1. Glossario
2. Diagrama de contexto
3. ER Mermaid
4. State machine
5. Matriz de permissoes
6. Modelo relacional atual
7. Casos de uso
8. OpenAPI 3.1 (sem campos extras)
9. Arquitetura sugerida sem alterar schema
10. Roadmap

## Criterios de aceite
- Qualquer item fora do schema deve ser marcado como "futuro" e nao incorporado na modelagem atual.
- Nenhum endpoint deve exigir campo inexistente no banco.
- Nenhuma regra deve depender de status nao existente.
