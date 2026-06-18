import { Router } from "express";
import { z } from "zod";
import { execute, query } from "../config/db";
import { requirePerfil } from "../middlewares/rbac";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

const router = Router();

const obraSchema = z.object({
  nome: z.string().min(1).max(150),
  contrato: z.string().min(1).max(100),
  endereco: z.string().min(1)
});

router.get(
  "/",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (_req, res) => {
    const obras = await query<{
      id: number;
      nome: string;
      contrato: string;
      endereco: string;
    }>("SELECT id, nome, contrato, endereco FROM obras ORDER BY id DESC");

    res.json(obras);
  })
);

router.get(
  "/:id",
  requirePerfil("ADMIN", "FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const obras = await query<{
      id: number;
      nome: string;
      contrato: string;
      endereco: string;
    }>("SELECT id, nome, contrato, endereco FROM obras WHERE id = ?", [id]);

    if (obras.length === 0) {
      throw new HttpError(404, "Obra nao encontrada");
    }

    res.json(obras[0]);
  })
);

router.post(
  "/",
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const data = obraSchema.parse(req.body);

    await execute("INSERT INTO obras (nome, contrato, endereco) VALUES (?, ?, ?)", [
      data.nome,
      data.contrato,
      data.endereco
    ]);

    res.status(201).json({ message: "Obra criada com sucesso" });
  })
);

router.put(
  "/:id",
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = obraSchema.parse(req.body);

    const result = (await execute("UPDATE obras SET nome = ?, contrato = ?, endereco = ? WHERE id = ?", [
      data.nome,
      data.contrato,
      data.endereco,
      id
    ])) as { affectedRows?: number };

    if (!result.affectedRows) {
      throw new HttpError(404, "Obra nao encontrada");
    }

    res.json({ message: "Obra atualizada com sucesso" });
  })
);

export default router;
