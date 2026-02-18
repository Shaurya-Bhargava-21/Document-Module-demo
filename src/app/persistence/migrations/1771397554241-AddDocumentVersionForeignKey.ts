import {type MigrationInterface, type QueryRunner } from "typeorm";

export class AddDocumentVersionForeignKey1771397554241 implements MigrationInterface {
    name = 'AddDocumentVersionForeignKey1771397554241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documentversions" ADD CONSTRAINT "FK_4ac55e48242f85cef71638f6ddb" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documentversions" DROP CONSTRAINT "FK_4ac55e48242f85cef71638f6ddb"`);
    }

}
