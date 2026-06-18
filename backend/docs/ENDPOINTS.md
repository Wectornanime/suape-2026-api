# Guia de Endpoints Iniciais

Base URL: `/api`

## Documentacao interativa
- `GET /api-docs`

## Usuarios
- `GET /usuarios` (ADMIN)
- `GET /usuarios/{id}` (ADMIN)
- `POST /usuarios` (ADMIN)
- `PUT /usuarios/{id}` (ADMIN)

Body `POST|PUT /usuarios`:
```json
{
  "nome": "Joao Silva",
  "email": "joao@email.com",
  "perfil": "FORNECEDOR"
}
```

## Obras
- `GET /obras` (todos os perfis)
- `GET /obras/{id}` (todos os perfis)
- `POST /obras` (ADMIN)
- `PUT /obras/{id}` (ADMIN)

Body `POST|PUT /obras`:
```json
{
  "nome": "Obra Terminal Sul",
  "contrato": "CT-2026-001",
  "endereco": "Porto de SUAPE"
}
```

## RDO
- `GET /rdos` (todos os perfis)
- `GET /rdos/{id}` (todos os perfis)
- `POST /rdos` (ADMIN, FORNECEDOR)
- `PUT /rdos/{id}` (ADMIN, FORNECEDOR)
- `POST /rdos/{id}/enviar` (ADMIN, FORNECEDOR)

Body `POST /rdos`:
```json
{
  "obra_id": 1,
  "fornecedor_id": 1,
  "data_rdo": "2026-06-18",
  "atividades": "Escavacao de vala",
  "equipe": [{ "funcao": "Engenheiro", "quantidade": 1 }],
  "equipamentos": [{ "nome": "Retroescavadeira", "quantidade": 1 }],
  "comentarios": "Sem intercorrencias",
  "clima": "Ensolarado",
  "ocorrencias": "Nenhuma",
  "conclusao_etapa": "Etapa concluida",
  "status": "RASCUNHO"
}
```

## Midias do RDO
- `GET /rdos/{id}/midias` (todos os perfis)
- `POST /rdos/{id}/midias` (todos os perfis)

Body `POST /rdos/{id}/midias`:
```json
{
  "tipo": "FOTO",
  "nome_arquivo": "frente_obra_001.jpg",
  "extensao": "jpg",
  "tamanho": 1245123,
  "caminho": "/uploads/obra-1/frente_obra_001.jpg",
  "descricao": "Frente da obra no inicio do turno"
}
```

## Aprovacoes do RDO
- `GET /rdos/{id}/aprovacoes` (todos os perfis)
- `POST /rdos/{id}/aprovacoes` (ADMIN, FISCAL_EXTERNO, FISCAL_SUAPE)

Body `POST /rdos/{id}/aprovacoes`:
```json
{
  "usuario_id": 10,
  "status": "APROVADO",
  "observacao": "Conforme executado"
}
```

## Healthcheck
- `GET /health`
