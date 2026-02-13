// data source and all connection configuration
import dotenv from "dotenv"
dotenv.config()
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DocumentEntity } from "./entities/DocumentEntity.js";
import { DocumentVersionEntity } from "./entities/DocumentVersionEntity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  synchronize: false,
  logging: true,
  entities: [DocumentEntity, DocumentVersionEntity],
  migrations: ["src/app/persistence/migrations/*.ts"],
  migrationsTableName: "migrations_history",
});