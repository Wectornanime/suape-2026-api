import { Pool, QueryResultRow } from "pg";
import { env } from "./env";

const poolConfig = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
      max: env.dbConnectionLimit
    }
  : {
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
      ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
      max: env.dbConnectionLimit
    };

export const pool = new Pool(poolConfig);

type SqlParam = string | number | boolean | Date | Buffer | null;

function toPostgresPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

export async function query<T extends QueryResultRow>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  const text = toPostgresPlaceholders(sql);
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function execute(sql: string, params: SqlParam[] = []) {
  const text = toPostgresPlaceholders(sql);
  const result = await pool.query(text, params);
  return { affectedRows: result.rowCount ?? 0 };
}
