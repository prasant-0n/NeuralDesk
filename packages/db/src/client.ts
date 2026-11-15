import * as dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index.js";

dotenv.config();

export type Schema = typeof schema;
export type PgDatabase = NodePgDatabase<Schema>;
export type NeonDatabase = NeonHttpDatabase<Schema>;
export type LibsqlDatabase = LibSQLDatabase;

export type DbClient = PgDatabase | NeonDatabase;

export interface DatabaseConfig {
  connectionString?: string;
  maxPoolSize?: number;
  ssl?: boolean | pg.ConnectionConfig["ssl"];
}

/**
 * Creates a PostgreSQL connection pool and typed Drizzle instance.
 */
export function createPgPool(
  connectionString?: string,
  options?: { maxPoolSize?: number; ssl?: boolean | pg.ConnectionConfig["ssl"] }
): PgDatabase {
  const connStr =
    connectionString ||
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/neuraldesk_dev";
  const requiresSsl =
    options?.ssl ??
    (connStr.includes("sslmode=require") || connStr.includes("neon.tech"));

  const pool = new Pool({
    connectionString: connStr,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
    max: options?.maxPoolSize ?? parseInt(process.env.DATABASE_POOL_SIZE || "10", 10),
  });

  return drizzlePg(pool, { schema });
}

/**
 * Creates a serverless Neon HTTP client and typed Drizzle instance.
 */
export function createNeonClient(connectionString?: string): NeonDatabase {
  const connStr = connectionString || process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error("DATABASE_URL must be provided for Neon HTTP client");
  }
  const sql = neon(connStr);
  return drizzleNeon(sql, { schema });
}

/**
 * Fallback connection factory for local / edge SQLite using libSQL.
 */
export function createLibsqlClient(
  connectionString?: string,
  authToken?: string
): LibsqlDatabase {
  const url = connectionString || process.env.DATABASE_URL || "file:local.db";
  const client = createClient({
    url,
    authToken: authToken || process.env.DATABASE_AUTH_TOKEN,
  });
  return drizzleLibsql(client);
}

/**
 * General Connection Factory: automatically inspects connection string
 * and instantiates the appropriate production-grade Drizzle database client.
 */
export function createDbClient(config: DatabaseConfig = {}): DbClient {
  const connStr =
    config.connectionString ||
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/neuraldesk_dev";

  // Check if Neon serverless HTTP is preferred (e.g. cloud serverless / edge runtime)
  if (connStr.includes("neon.tech") && process.env.USE_NEON_HTTP === "true") {
    return createNeonClient(connStr);
  }

  // Standard PostgreSQL (Neon / Supabase / local pg with connection pooling)
  return createPgPool(connStr, {
    maxPoolSize: config.maxPoolSize,
    ssl: config.ssl,
  });
}

/**
 * Default singleton database instance.
 */
export const db: DbClient = createDbClient();
