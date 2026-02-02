// data source and all connection configuration
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DocumentEntity } from "./entities/DocumentEntity.js";
import { DocumentVersionEntity } from "./entities/DocumentVersionEntity.js";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "naehas123",
    database: "demofordocument",
    synchronize: true,
    logging: true,
    entities: [DocumentEntity, DocumentVersionEntity],
});
//# sourceMappingURL=data-source.js.map