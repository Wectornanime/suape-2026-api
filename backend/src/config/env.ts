import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().optional(),
  DB_CONNECTION_LIMIT: z.string().default("10"),
  DB_SSL: z.enum(["true", "false"]).default("false")
}).superRefine((data, ctx) => {
  if (!data.DATABASE_URL) {
    if (!data.DB_HOST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DB_HOST"],
        message: "DB_HOST e obrigatorio quando DATABASE_URL nao e informado"
      });
    }

    if (!data.DB_USER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DB_USER"],
        message: "DB_USER e obrigatorio quando DATABASE_URL nao e informado"
      });
    }

    if (!data.DB_NAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DB_NAME"],
        message: "DB_NAME e obrigatorio quando DATABASE_URL nao e informado"
      });
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variaveis de ambiente invalidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: Number(parsed.data.PORT),
  databaseUrl: parsed.data.DATABASE_URL,
  dbHost: parsed.data.DB_HOST,
  dbPort: Number(parsed.data.DB_PORT),
  dbUser: parsed.data.DB_USER,
  dbPassword: parsed.data.DB_PASSWORD,
  dbName: parsed.data.DB_NAME,
  dbConnectionLimit: Number(parsed.data.DB_CONNECTION_LIMIT),
  dbSsl: parsed.data.DB_SSL === "true"
};
