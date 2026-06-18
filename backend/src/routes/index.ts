import { Router } from "express";
import usuariosRoutes from "./usuarios.routes";
import obrasRoutes from "./obras.routes";
import rdosRoutes from "./rdos.routes";

const router = Router();

router.use("/usuarios", usuariosRoutes);
router.use("/obras", obrasRoutes);
router.use("/rdos", rdosRoutes);

export default router;
