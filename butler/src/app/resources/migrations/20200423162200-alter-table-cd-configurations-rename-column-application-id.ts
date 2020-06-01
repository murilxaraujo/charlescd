import {MigrationInterface, QueryRunner} from 'typeorm'

export class AlterTableCdConfigurationsRenameColumnApplication20200423162200 implements MigrationInterface {

    public async up(queryRunner: QueryRunner) {
        await queryRunner.renameColumn('cd_configurations', 'application_id', 'workspace_id')
    }

    public async down(queryRunner: QueryRunner) {
        await queryRunner.renameColumn('cd_configurations', 'workspace_id', 'application_id')
    }
}
