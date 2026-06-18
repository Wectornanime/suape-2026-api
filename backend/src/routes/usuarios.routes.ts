import { Router } from "express";
import { z } from "zod";
import { execute, query } from "../config/db";
import { requirePerfil } from "../middlewares/rbac";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

const router = Router();

const perfilEnum = z.enum(["FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE", "ADMIN"]);

const usuarioSchema = z.object({
  nome: z.string().min(1).max(150),
  email: z.string().email().max(150),
  perfil: perfilEnum
});

router.get(
  "/",
  requirePerfil("ADMIN"),
  asyncHandler(async (_req, res) => {
    const usuarios = await query<{
      id: number;
      nome: string;
      email: string;
      perfil: string;
    }>("SELECT id, nome, email, perfil FROM usuarios ORDER BY id DESC");

    res.json(usuarios);
  })
);

router.get(
  "/:id",
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const usuarios = await query<{
      id: number;
      nome: string;
      email: string;
      perfil: string;
    }>("SELECT id, nome, email, perfil FROM usuarios WHERE id = ?", [id]);

    if (usuarios.length === 0) {
      throw new HttpError(404, "Usuario nao encontrado");
    }

    res.json(usuarios[0]);
  })
);

router.post(
  "/",
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const data = usuarioSchema.parse(req.body);

    await execute("INSERT INTO usuarios (nome, email, perfil) VALUES (?, ?, ?)", [data.nome, data.email, data.perfil]);

    res.status(201).json({ message: "Usuario criado com sucesso" });
  })
);

router.put(
  "/:id",
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = usuarioSchema.parse(req.body);

    const result = (await execute("UPDATE usuarios SET nome = ?, email = ?, perfil = ? WHERE id = ?", [
      data.nome,
      data.email,
      data.perfil,
      id
    ])) as { affectedRows?: number };

    if (!result.affectedRows) {
      throw new HttpError(404, "Usuario nao encontrado");
    }

    res.json({ message: "Usuario atualizado com sucesso" });
  })
);

export default router;
