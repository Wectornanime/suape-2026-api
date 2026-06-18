import { Pool, QueryResultRow } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  max: env.dbConnectionLimit
});

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
