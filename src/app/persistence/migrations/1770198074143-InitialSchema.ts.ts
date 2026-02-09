import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770198074143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "documents_type_enum" AS ENUM('PDF', 'JPG', 'PNG', 'TXT')`,
    );

    await queryRunner.query(
      `CREATE TYPE "documents_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'DELETED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "type" "documents_type_enum" NOT NULL,
        "status" "documents_status_enum" NOT NULL DEFAULT 'PUBLISHED',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "documentversions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" numeric NOT NULL,
        "content" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "documentId" uuid,
        CONSTRAINT "PK_documentversions" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "documentversions" 
      DROP CONSTRAINT "FK_documentversions_documentId"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "documentversions"`);
    await queryRunner.query(`DROP TABLE "documents"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "documents_status_enum"`);
    await queryRunner.query(`DROP TYPE "documents_type_enum"`);
  }
}
