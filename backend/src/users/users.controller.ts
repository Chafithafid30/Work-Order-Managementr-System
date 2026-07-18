import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  @Get()
  findAll(
    @Query('role', new ParseEnumPipe(UserRole, { optional: true }))
    role?: UserRole,
  ) {
    return this.users.find({
      where: role ? { role } : {},
      order: { role: 'ASC', name: 'ASC' },
    });
  }
}
