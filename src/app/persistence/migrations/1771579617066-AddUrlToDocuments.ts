import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddUrlToDocuments1771579617066 implements MigrationInterface {
    name = 'AddUrlToDocuments1771579617066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" ADD "url" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "url"`);
    }

}
