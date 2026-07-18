import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // passwordHash is excluded by default at entity level; select it only for
    // credential verification to avoid accidental exposure in other queries.
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email: dto.email.trim() })
      .getOne();
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    // Keep the token payload minimal. The strategy reloads authoritative user
    // data from PostgreSQL for every authenticated request.
    const accessToken = await this.jwtService.signAsync(
      { email: user.email, role: user.role },
      { subject: user.id },
    );
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 3600),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
