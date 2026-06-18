import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

function loadOpenApiDocument() {
  const openApiPath = path.resolve(process.cwd(), "docs", "API_OPENAPI.yaml");
  const fileContent = fs.readFileSync(openApiPath, "utf-8");
  return yaml.load(fileContent) as Record<string, unknown>;
}

router.use("/api-docs", swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = loadOpenApiDocument();
    return swaggerUi.setup(document, {
      customSiteTitle: "RDO SUAPE - API Docs"
    })(req, res, next);
  } catch (error) {
    return res.status(500).json({
      message: "Nao foi possivel carregar o arquivo OpenAPI em docs/API_OPENAPI.yaml",
      error: error instanceof Error ? error.message : "erro desconhecido"
    });
  }
});

export default router;
