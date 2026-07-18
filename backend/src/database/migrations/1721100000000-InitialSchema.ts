import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1721100000000 implements MigrationInterface {
  name = 'InitialSchema1721100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      "CREATE TYPE user_role AS ENUM ('ADMIN', 'SPV', 'MECHANIC')",
    );
    await queryRunner.query(
      "CREATE TYPE work_order_status AS ENUM ('DRAFT','SUBMITTED','ASSIGNED','UPDATED','WAITING_SPAREPART_APPROVAL','READY_TO_WORK','WORKING','COMPLETED')",
    );
    await queryRunner.query(
      "CREATE TYPE sparepart_request_status AS ENUM ('PENDING','APPROVED')",
    );
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(100) NOT NULL,
        role user_role NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE work_orders (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(150) NOT NULL,
        description text,
        status work_order_status NOT NULL DEFAULT 'DRAFT',
        created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        assigned_mechanic_id uuid REFERENCES users(id) ON DELETE RESTRICT,
        start_date timestamptz,
        end_date timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        version integer NOT NULL DEFAULT 1,
        CONSTRAINT valid_work_order_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
      )
    `);
    await queryRunner.query(
      'CREATE INDEX idx_work_orders_status ON work_orders(status)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_work_orders_mechanic ON work_orders(assigned_mechanic_id)',
    );
    await queryRunner.query(`
      CREATE TABLE sparepart_requests (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
        status sparepart_request_status NOT NULL DEFAULT 'PENDING',
        requested_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        approved_by uuid REFERENCES users(id) ON DELETE RESTRICT,
        approval_note text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_pending_sparepart_request_per_work_order
      ON sparepart_requests(work_order_id) WHERE status = 'PENDING'
    `);
    await queryRunner.query(`
      CREATE TABLE sparepart_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sparepart_request_id uuid NOT NULL REFERENCES sparepart_requests(id) ON DELETE CASCADE,
        name varchar(120) NOT NULL,
        qty integer NOT NULL CHECK (qty > 0),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE idempotency_records (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        operation varchar(100) NOT NULL,
        key varchar(100) NOT NULL,
        actor_id uuid NOT NULL,
        response jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_idempotency_operation_key_actor UNIQUE (operation, key, actor_id)
      )
    `);
    await queryRunner.query(`
      INSERT INTO users (name, role) VALUES
        ('Alya Admin', 'ADMIN'),
        ('Surya SPV', 'SPV'),
        ('Mekanik Budi', 'MECHANIC'),
        ('Mekanik Citra', 'MECHANIC')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE idempotency_records');
    await queryRunner.query('DROP TABLE sparepart_items');
    await queryRunner.query('DROP TABLE sparepart_requests');
    await queryRunner.query('DROP TABLE work_orders');
    await queryRunner.query('DROP TABLE users');
    await queryRunner.query('DROP TYPE sparepart_request_status');
    await queryRunner.query('DROP TYPE work_order_status');
    await queryRunner.query('DROP TYPE user_role');
  }
}
