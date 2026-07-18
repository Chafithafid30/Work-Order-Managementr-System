import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDemoUsers1721100002000 implements MigrationInterface {
  name = 'RenameDemoUsers1721100002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update by stable email instead of the display name so this migration is
    // deterministic even when names have already been edited manually.
    await queryRunner.query(`
      UPDATE users
      SET name = CASE email
        WHEN 'admin@workflow.local' THEN 'Admin'
        WHEN 'spv@workflow.local' THEN 'SPV'
        WHEN 'budi@workflow.local' THEN 'Mekanik'
        ELSE name
      END,
      email = CASE email
        WHEN 'budi@workflow.local' THEN 'mechanic@workflow.local'
        ELSE email
      END
      WHERE email IN (
        'admin@workflow.local',
        'spv@workflow.local',
        'budi@workflow.local'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users
      SET name = CASE email
        WHEN 'admin@workflow.local' THEN 'Alya Admin'
        WHEN 'spv@workflow.local' THEN 'Surya SPV'
        WHEN 'mechanic@workflow.local' THEN 'Mekanik Budi'
        ELSE name
      END,
      email = CASE email
        WHEN 'mechanic@workflow.local' THEN 'budi@workflow.local'
        ELSE email
      END
      WHERE email IN (
        'admin@workflow.local',
        'spv@workflow.local',
        'mechanic@workflow.local'
      )
    `);
  }
}
