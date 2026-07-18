import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns a JWT for valid credentials', async () => {
    const user = {
      id: '628cecff-6ff2-472f-b98f-bd110cfa5318',
      name: 'Admin',
      email: 'admin@workflow.local',
      role: UserRole.ADMIN,
      passwordHash: await hash('Password123!', 4),
    } as User;
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };
    const users = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    const service = new AuthService(
      users as unknown as Repository<User>,
      jwt as unknown as JwtService,
    );

    const result = await service.login({
      email: user.email,
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { email: user.email, role: UserRole.ADMIN },
      { subject: user.id },
    );
  });

  it('rejects unknown credentials', async () => {
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    const users = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const service = new AuthService(
      users as unknown as Repository<User>,
      { signAsync: jest.fn() } as unknown as JwtService,
    );

    await expect(
      service.login({
        email: 'unknown@workflow.local',
        password: 'Password123!',
      }),
    ).rejects.toThrow('Email or password is incorrect');
  });
});
