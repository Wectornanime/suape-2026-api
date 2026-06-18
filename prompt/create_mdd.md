# PROMPT - Arquitetura e Desenvolvimento MDD de API para RDO (Compativel com Banco Atual)

Atue como Arquiteto de Software Senior em DDD/MDD.

## Restricao obrigatoria
- Nao gere codigo.
- Nao crie campos novos.
- Nao crie tabelas novas.
- Nao altere enums existentes.
- Toda modelagem deve ser compativel com o schema SQL abaixo.

## Schema fonte de verdade

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150),
    email VARCHAR(150),
    perfil ENUM(
        'FORNECEDOR',
        'FISCAL_EXTERNO',
        'FISCAL_SUAPE',
        'ADMIN'
    )
);

CREATE TABLE obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150),
    contrato VARCHAR(100),
    endereco TEXT
);

CREATE TABLE rdos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT,
    fornecedor_id INT,
    data_rdo DATE,

    atividades TEXT,
    equipe JSON,
    equipamentos JSON,
    comentarios TEXT,
    clima VARCHAR(50),
    ocorrencias TEXT,
    conclusao_etapa TEXT,

    status ENUM(
        'RASCUNHO',
        'ENVIADO',
        'APROVADO_EXTERNO',
        'APROVADO_SUAPE',
        'REPROVADO'
    ) DEFAULT 'RASCUNHO',

    FOREIGN KEY (obra_id) REFERENCES obras(id),
    FOREIGN KEY (fornecedor_id) REFERENCES usuarios(id)
);

CREATE TABLE rdo_midias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rdo_id INT NOT NULL,

    tipo ENUM(
        'FOTO',
        'VIDEO',
        'ANEXO'
    ),

    nome_arquivo VARCHAR(255),
    extensao VARCHAR(20),
    tamanho BIGINT,
    caminho TEXT,
    descricao TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rdo_id) REFERENCES rdos(id)
);

CREATE TABLE rdo_aprovacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rdo_id INT,
    usuario_id INT,

    status ENUM(
        'APROVADO',
        'REPROVADO',
        'DEVOLVIDO'
    ),

    observacao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rdo_id) REFERENCES rdos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---

# ETAPA 1 - COMPREENSAAO DO NEGOCIO
Documente os objetivos do sistema, limitando as regras ao que e suportado pelas tabelas existentes.

---

# ETAPA 2 - MODELAGEM DE DOMINIO

## Entidades
Use apenas entidades mapeadas no banco:
- Usuario
- Obra
- RDO
- RDOMidia
- RDOAprovacao

## Value Objects (conceituais)
- PerfilUsuario
- StatusRDO
- StatusAprovacao
- TipoMidia

## Agregados
- Defina Aggregate Root principal em RDO.
- Justifique sem exigir novos campos.

## Relacionamentos
- Cardinalidades conforme FKs existentes.
- Diagrama Mermaid ER fiel ao schema.

---

# ETAPA 3 - REGRAS DE NEGOCIO

## Perfis
- Baseados apenas em `usuarios.perfil`.

## Fluxo RDO
Status possiveis:
- RASCUNHO
- ENVIADO
- APROVADO_EXTERNO
- APROVADO_SUAPE
- REPROVADO

- Defina transicoes validas apenas com esses status.
- Use `rdo_aprovacoes.status = DEVOLVIDO` para devolucao.
- Defina comportamento de retorno para `RASCUNHO` sem criar status novo.

- Gerar State Machine em Mermaid.

---

# ETAPA 4 - MODELAGEM DE DADOS
- Documentar somente as tabelas existentes.
- Para cada tabela: campos, tipos, PK, FK.
- Nao propor colunas extras.
- Gerar ER Mermaid.

---

# ETAPA 5 - CASOS DE USO
Liste casos de uso compativeis com o schema atual.
Para cada caso:
- Objetivo
- Atores
- Pre-condicoes
- Fluxo principal
- Fluxos alternativos
- Pos-condicoes

---

# ETAPA 6 - ESPECIFICACAO DA API
Apenas apos modelagem.

Recursos esperados:
- /usuarios
- /obras
- /rdos
- /rdos/{id}/midias
- /rdos/{id}/aprovacoes
- /rdos/{id}/enviar

Para cada endpoint:
- Metodo HTTP
- Request/Response
- Autorizacao por perfil
- Codigos HTTP
- Erros possiveis

Regra: requests/responses sem campos inexistentes.

---

# ETAPA 7 - SEGURANCA
- Pode modelar JWT/RBAC em camada de aplicacao.
- Nao exigir novos campos no banco.

---

# ETAPA 8 - SINCRONIZACAO OFFLINE
- Definir estrategia operacional sem criar tabelas/colunas extras.

---

# ETAPA 9 - RELATORIOS
- Modelar relatorios usando apenas:
  - rdos
  - rdo_midias
  - rdo_aprovacoes

---

# ETAPA 10 - ENTREGAVEIS FINAIS
Ao final gerar:
1. Glossario
2. Diagrama de contexto
3. Diagrama ER
4. State Machine do RDO
5. Matriz de perfis
6. Modelo relacional atual
7. Casos de uso
8. OpenAPI 3.1 compativel
9. Arquitetura sugerida (sem alteracao de schema)
10. Roadmap

Checklist final obrigatorio:
- Confirmar explicitamente: "Nenhum campo novo foi criado".
# PROMPT - Arquitetura e Desenvolvimento MDD de API para Sistema de Diario de Obras (RDO)

Atue como Arquiteto de Software Senior especializado em DDD, MDD, Arquitetura Hexagonal e APIs REST.

Sua missao e modelar e especificar uma API backend para um Sistema de Registro de Diario de Obras (RDO).

## RESTRICAO PRINCIPAL (OBRIGATORIA)
- Nao gerar codigo.
- Nao criar novas tabelas.
- Nao criar novos campos.
- Nao alterar enums existentes.
- Toda modelagem deve ser estritamente compativel com o schema abaixo.

---

## SCHEMA DE REFERENCIA (FONTE DE VERDADE)

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150),
    email VARCHAR(150),
    perfil ENUM(
        'FORNECEDOR',
        'FISCAL_EXTERNO',
        'FISCAL_SUAPE',
        'ADMIN'
    )
);

CREATE TABLE obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150),
    contrato VARCHAR(100),
    endereco TEXT
);

CREATE TABLE rdos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT,
    fornecedor_id INT,
    data_rdo DATE,

    atividades TEXT,
    equipe JSON,
    equipamentos JSON,
    comentarios TEXT,
    clima VARCHAR(50),
    ocorrencias TEXT,
    conclusao_etapa TEXT,

    status ENUM(
        'RASCUNHO',
        'ENVIADO',
        'APROVADO_EXTERNO',
        'APROVADO_SUAPE',
        'REPROVADO'
    ) DEFAULT 'RASCUNHO',

    FOREIGN KEY (obra_id) REFERENCES obras(id),
    FOREIGN KEY (fornecedor_id) REFERENCES usuarios(id)
);

CREATE TABLE rdo_midias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rdo_id INT NOT NULL,

    tipo ENUM(
        'FOTO',
        'VIDEO',
        'ANEXO'
    ),

    nome_arquivo VARCHAR(255),
    extensao VARCHAR(20),
    tamanho BIGINT,
    caminho TEXT,
    descricao TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rdo_id) REFERENCES rdos(id)
);

CREATE TABLE rdo_aprovacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rdo_id INT,
    usuario_id INT,

    status ENUM(
        'APROVADO',
        'REPROVADO',
        'DEVOLVIDO'
    ),

    observacao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rdo_id) REFERENCES rdos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---

# ETAPA 1 - COMPREENSAO DO NEGOCIO

Analise e documente:
- Objetivos do sistema.
- Atores (Fornecedor, Fiscal Externo, Fiscal SUAPE, Admin).
- Limites funcionais considerando somente o schema atual.

---

# ETAPA 2 - MODELAGEM DE DOMINIO

Identifique somente entidades compativeis com o banco:
- Usuario
- Obra
- RDO
- RDOMidia
- RDOAprovacao

## Value Objects (conceituais)
- PerfilUsuario
- StatusRDO
- StatusAprovacao
- TipoMidia

## Agregados
- RDO como agregado principal.
- Justifique os agregados sem propor novos campos.

## Relacionamentos
- Informe cardinalidades e regras de integridade conforme FKs existentes.
- Gere diagrama ER em Mermaid fiel ao schema.

---

# ETAPA 3 - REGRAS DE NEGOCIO

## Perfis
- Usar apenas `usuarios.perfil`.

## Fluxo RDO
Status possiveis (somente estes):
- RASCUNHO
- ENVIADO
- APROVADO_EXTERNO
- APROVADO_SUAPE
- REPROVADO

Defina transicoes validas usando apenas esses status.

Observacao obrigatoria:
- "DEVOLVIDO" existe em `rdo_aprovacoes.status`; se houver devolucao, definir regra de retorno do RDO para `RASCUNHO` sem criar novo status na tabela `rdos`.

Gerar State Machine em Mermaid.

---

# ETAPA 4 - MODELAGEM DE DADOS

Documente o modelo relacional exatamente como no schema:
- Tabelas
- Campos
- Tipos
- PK/FK
- Enums

Nao inventar indices, colunas ou tabelas novas.

Gerar ER Mermaid fiel ao banco atual.

---

# ETAPA 5 - CASOS DE USO

Liste casos de uso compativeis com as tabelas existentes.

Exemplos:
- Criar/editar usuario
- Criar/editar obra
- Criar/editar/enviar RDO
- Registrar aprovacao (aprovar, reprovar, devolver)
- Anexar midia ao RDO

Para cada caso de uso:
- Objetivo
- Atores
- Pre-condicoes
- Fluxo principal
- Fluxos alternativos
- Pos-condicoes

---

# ETAPA 6 - ESPECIFICACAO DA API

Gerar recursos REST somente para:
- /usuarios
- /obras
- /rdos
- /rdos/{id}/midias
- /rdos/{id}/aprovacoes
- /rdos/{id}/enviar

Para cada endpoint:
- Metodo HTTP
- Request
- Response
- Regras de autorizacao por perfil
- Codigos HTTP

Nao incluir endpoints que dependam de campos nao existentes.

---

# ETAPA 7 - SEGURANCA

Modelar autenticao/autorizacao em nivel conceitual (ex.: JWT/RBAC) sem exigir alteracao no banco.

---

# ETAPA 8 - SINCRONIZACAO OFFLINE

Descrever estrategia operacional sem persistencia adicional no banco atual.

---

# ETAPA 9 - RELATORIOS

Modelar relatorios usando somente:
- rdos
- rdo_midias
- rdo_aprovacoes

---

# ETAPA 10 - ENTREGAVEIS FINAIS

Gerar:
1. Glossario do dominio.
2. Diagrama de contexto.
3. Diagrama ER.
4. State Machine do RDO.
5. Matriz de permissoes por perfil.
6. Modelo relacional atual.
7. Casos de uso.
8. OpenAPI 3.1 compativel com o schema.
9. Arquitetura sugerida sem mudanca de schema.
10. Roadmap.

## Checklist final obrigatorio
- [ ] Nenhuma tabela nova.
- [ ] Nenhum campo novo.
- [ ] Nenhum enum novo.
- [ ] Todos os endpoints usam apenas campos existentes.
