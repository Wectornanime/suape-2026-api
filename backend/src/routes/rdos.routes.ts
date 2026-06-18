import { Router } from "express";
import { z } from "zod";
import { execute, query } from "../config/db";
import { requirePerfil } from "../middlewares/rbac";
import { PerfilUsuario, StatusAprovacao, StatusRdo } from "../types/domain";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";
import { safeParseJson } from "../utils/json";

const router = Router();

const statusRdoEnum = z.enum(["RASCUNHO", "ENVIADO", "APROVADO_EXTERNO", "APROVADO_SUAPE", "REPROVADO"]);
const tipoMidiaEnum = z.enum(["FOTO", "VIDEO", "ANEXO"]);
const statusAprovacaoEnum = z.enum(["APROVADO", "REPROVADO", "DEVOLVIDO"]);

const rdoSchema = z.object({
  obra_id: z.number().int().positive(),
  fornecedor_id: z.number().int().positive(),
  data_rdo: z.string().min(1),
  atividades: z.string().min(1),
  equipe: z.unknown(),
  equipamentos: z.unknown(),
  comentarios: z.string().optional().default(""),
  clima: z.string().max(50).optional().default(""),
  ocorrencias: z.string().optional().default(""),
  conclusao_etapa: z.string().optional().default(""),
  status: statusRdoEnum.optional().default("RASCUNHO")
});

const rdoUpdateSchema = rdoSchema.omit({ obra_id: true, fornecedor_id: true }).extend({
  status: statusRdoEnum.optional()
});

const midiaSchema = z.object({
  tipo: tipoMidiaEnum,
  nome_arquivo: z.string().min(1).max(255),
  extensao: z.string().min(1).max(20),
  tamanho: z.number().int().nonnegative(),
  caminho: z.string().min(1),
  descricao: z.string().optional().default("")
});

const aprovacaoSchema = z.object({
  usuario_id: z.number().int().positive(),
  status: statusAprovacaoEnum,
  observacao: z.string().optional().default("")
});

type RdoRow = {
  id: number;
  obra_id: number;
  fornecedor_id: number;
  data_rdo: string;
  atividades: string;
  equipe: unknown;
  equipamentos: unknown;
  comentarios: string;
  clima: string;
  ocorrencias: string;
  conclusao_etapa: string;
  status: StatusRdo;
};

async function getRdoById(id: number) {
  const rows = await query<RdoRow>(
    "SELECT id, obra_id, fornecedor_id, data_rdo, atividades, equipe, equipamentos, comentarios, clima, ocorrencias, conclusao_etapa, status FROM rdos WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    throw new HttpError(404, "RDO nao encontrado");
  }

  const rdo = rows[0];
  return {
    ...rdo,
    equipe: safeParseJson(rdo.equipe),
    equipamentos: safeParseJson(rdo.equipamentos)
  };
}

router.get(
  "/",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (_req, res) => {
    const rows = await query<RdoRow>(
      "SELECT id, obra_id, fornecedor_id, data_rdo, atividades, equipe, equipamentos, comentarios, clima, ocorrencias, conclusao_etapa, status FROM rdos ORDER BY id DESC"
    );

    const data = rows.map((rdo) => ({
      ...rdo,
      equipe: safeParseJson(rdo.equipe),
      equipamentos: safeParseJson(rdo.equipamentos)
    }));

    res.json(data);
  })
);

router.get(
  "/:id",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const rdo = await getRdoById(id);

    res.json(rdo);
  })
);

router.post(
  "/",
  requirePerfil("ADMIN", "FORNECEDOR"),
  asyncHandler(async (req, res) => {
    const data = rdoSchema.parse(req.body);

    await execute(
      "INSERT INTO rdos (obra_id, fornecedor_id, data_rdo, atividades, equipe, equipamentos, comentarios, clima, ocorrencias, conclusao_etapa, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.obra_id,
        data.fornecedor_id,
        data.data_rdo,
        data.atividades,
        JSON.stringify(data.equipe),
        JSON.stringify(data.equipamentos),
        data.comentarios,
        data.clima,
        data.ocorrencias,
        data.conclusao_etapa,
        data.status
      ]
    );

    res.status(201).json({ message: "RDO criado com sucesso" });
  })
);

router.put(
  "/:id",
  requirePerfil("ADMIN", "FORNECEDOR"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = rdoUpdateSchema.parse(req.body);

    const result = (await execute(
      "UPDATE rdos SET data_rdo = ?, atividades = ?, equipe = ?, equipamentos = ?, comentarios = ?, clima = ?, ocorrencias = ?, conclusao_etapa = ?, status = COALESCE(?, status) WHERE id = ?",
      [
        data.data_rdo,
        data.atividades,
        JSON.stringify(data.equipe),
        JSON.stringify(data.equipamentos),
        data.comentarios,
        data.clima,
        data.ocorrencias,
        data.conclusao_etapa,
        data.status ?? null,
        id
      ]
    )) as { affectedRows?: number };

    if (!result.affectedRows) {
      throw new HttpError(404, "RDO nao encontrado");
    }

    res.json({ message: "RDO atualizado com sucesso" });
  })
);

router.post(
  "/:id/enviar",
  requirePerfil("ADMIN", "FORNECEDOR"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const rdo = await getRdoById(id);

    if (rdo.status !== "RASCUNHO") {
      throw new HttpError(409, "Somente RDO em RASCUNHO pode ser enviado");
    }

    await execute("UPDATE rdos SET status = 'ENVIADO' WHERE id = ?", [id]);
    res.json({ message: "RDO enviado com sucesso" });
  })
);

router.get(
  "/:id/midias",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const rdoId = Number(req.params.id);
    await getRdoById(rdoId);

    const midias = await query<{
      id: number;
      rdo_id: number;
      tipo: string;
      nome_arquivo: string;
      extensao: string;
      tamanho: number;
      caminho: string;
      descricao: string;
      criado_em: string;
    }>(
      "SELECT id, rdo_id, tipo, nome_arquivo, extensao, tamanho, caminho, descricao, criado_em FROM rdo_midias WHERE rdo_id = ? ORDER BY id DESC",
      [rdoId]
    );

    res.json(midias);
  })
);

router.post(
  "/:id/midias",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const rdoId = Number(req.params.id);
    await getRdoById(rdoId);

    const data = midiaSchema.parse(req.body);

    await execute(
      "INSERT INTO rdo_midias (rdo_id, tipo, nome_arquivo, extensao, tamanho, caminho, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [rdoId, data.tipo, data.nome_arquivo, data.extensao, data.tamanho, data.caminho, data.descricao]
    );

    res.status(201).json({ message: "Midia registrada com sucesso" });
  })
);

router.get(
  "/:id/aprovacoes",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const rdoId = Number(req.params.id);
    await getRdoById(rdoId);

    const aprovacoes = await query<{
      id: number;
      rdo_id: number;
      usuario_id: number;
      status: StatusAprovacao;
      observacao: string;
      criado_em: string;
    }>(
      "SELECT id, rdo_id, usuario_id, status, observacao, criado_em FROM rdo_aprovacoes WHERE rdo_id = ? ORDER BY id DESC",
      [rdoId]
    );

    res.json(aprovacoes);
  })
);

function resolveNextStatus(currentStatus: StatusRdo, perfil: PerfilUsuario, aprovacao: StatusAprovacao): StatusRdo {
  if (currentStatus === "ENVIADO" && perfil === "FISCAL_EXTERNO") {
    if (aprovacao === "APROVADO") return "APROVADO_EXTERNO";
    if (aprovacao === "REPROVADO") return "REPROVADO";
    return "RASCUNHO";
  }

  if (currentStatus === "APROVADO_EXTERNO" && perfil === "FISCAL_SUAPE") {
    if (aprovacao === "APROVADO") return "APROVADO_SUAPE";
    if (aprovacao === "REPROVADO") return "REPROVADO";
    return "RASCUNHO";
  }

  throw new HttpError(409, "Aprovacao invalida para o status atual do RDO");
}

router.post(
  "/:id/aprovacoes",
  requirePerfil("ADMIN", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const rdoId = Number(req.params.id);
    const data = aprovacaoSchema.parse(req.body);

    const rdo = await getRdoById(rdoId);

    const userRows = await query<{ id: number; perfil: PerfilUsuario }>(
      "SELECT id, perfil FROM usuarios WHERE id = ?",
      [data.usuario_id]
    );

    if (userRows.length === 0) {
      throw new HttpError(404, "Usuario da aprovacao nao encontrado");
    }

    const perfil = userRows[0].perfil;
    const nextStatus = resolveNextStatus(rdo.status, perfil, data.status);

    await execute("INSERT INTO rdo_aprovacoes (rdo_id, usuario_id, status, observacao) VALUES (?, ?, ?, ?)", [
      rdoId,
      data.usuario_id,
      data.status,
      data.observacao
    ]);

    await execute("UPDATE rdos SET status = ? WHERE id = ?", [nextStatus, rdoId]);

    res.status(201).json({ message: "Aprovacao registrada com sucesso", next_status: nextStatus });
  })
);

export default router;
