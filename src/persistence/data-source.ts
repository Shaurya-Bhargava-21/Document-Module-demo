// data source and all connection configuration
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DocumentEntity } from "./entities/DocumentEntity.js";
import { DocumentVersionEntity } from "./entities/DocumentVersionEntity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "admin",
  password: "admin123",
  database: "mydb",
  synchronize: false,
  logging: true,     
  entities: [DocumentEntity,DocumentVersionEntity],
  migrations: ["src/persistence/migrations/*.ts"],
  migrationsTableName: "migrations_history"
});