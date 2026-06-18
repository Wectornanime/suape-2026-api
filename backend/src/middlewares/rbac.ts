import { NextFunction, Request, Response } from "express";
import { PerfilUsuario } from "../types/domain";

const allowedPerfis: PerfilUsuario[] = ["FORNECEDOR", "FISCAL_EXTERNO", "FISCAL_SUAPE", "ADMIN"];

export function requirePerfil(...perfis: PerfilUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawPerfil = req.header("x-user-perfil");

    if (!rawPerfil || !allowedPerfis.includes(rawPerfil as PerfilUsuario)) {
      return res.status(401).json({ message: "Perfil de usuario ausente ou invalido no header x-user-perfil" });
    }

    if (!perfis.includes(rawPerfil as PerfilUsuario)) {
      return res.status(403).json({ message: "Perfil sem permissao para esta operacao" });
    }

    return next();
  };
}
