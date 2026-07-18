import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthentication1721100001000 implements MigrationInterface {
  name = 'AddAuthentication1721100001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users ADD COLUMN email varchar(160)');
    await queryRunner.query(
      'ALTER TABLE users ADD COLUMN password_hash varchar(255)',
    );
    await queryRunner.query(`
      UPDATE users
      SET
        email = CASE name
          WHEN 'Alya Admin' THEN 'admin@workflow.local'
          WHEN 'Surya SPV' THEN 'spv@workflow.local'
          WHEN 'Mekanik Budi' THEN 'budi@workflow.local'
          WHEN 'Mekanik Citra' THEN 'citra@workflow.local'
          ELSE lower(replace(name, ' ', '.')) || '@workflow.local'
        END,
        password_hash = '$2b$12$DCU4swBSnXwddQVfRJWRjesevFEbclEJcrFDSz6m7ovzZyvnUWge6'
    `);
    await queryRunner.query(
      'ALTER TABLE users ALTER COLUMN email SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX uq_users_email ON users(email)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX uq_users_email');
    await queryRunner.query('ALTER TABLE users DROP COLUMN password_hash');
    await queryRunner.query('ALTER TABLE users DROP COLUMN email');
  }
}
