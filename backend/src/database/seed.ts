import dataSource from './data-source';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { hash } from 'bcryptjs';

async function seed(): Promise<void> {
  await dataSource.initialize();
  const repository = dataSource.getRepository(User);
  if ((await repository.count()) === 0) {
    const passwordHash = await hash('Password123!', 12);
    await repository.save([
      repository.create({
        name: 'Admin',
        email: 'admin@workflow.local',
        passwordHash,
        role: UserRole.ADMIN,
      }),
      repository.create({
        name: 'SPV',
        email: 'spv@workflow.local',
        passwordHash,
        role: UserRole.SPV,
      }),
      repository.create({
        name: 'Mekanik',
        email: 'mechanic@workflow.local',
        passwordHash,
        role: UserRole.MECHANIC,
      }),
      repository.create({
        name: 'Mekanik Citra',
        email: 'citra@workflow.local',
        passwordHash,
        role: UserRole.MECHANIC,
      }),
    ]);
  }
  await dataSource.destroy();
}

void seed();
