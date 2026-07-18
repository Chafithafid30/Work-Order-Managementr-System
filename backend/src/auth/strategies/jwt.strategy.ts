import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { AuthUser, JwtPayload } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Do not trust a possibly stale role embedded in a still-valid token.
    // Reloading the user applies role changes and account deletion immediately.
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user)
      throw new UnauthorizedException('User account is no longer available');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
