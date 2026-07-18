import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class ActorService {
  /** Revalidates the database role inside the transaction as defense in depth. */
  async requireRole(
    manager: EntityManager,
    actorId: string,
    expectedRole: UserRole,
  ): Promise<User> {
    const actor = await manager.findOne(User, { where: { id: actorId } });
    if (!actor) throw new NotFoundException('Actor was not found');
    if (actor.role !== expectedRole) {
      throw new ForbiddenException(
        `This action requires the ${expectedRole} role`,
      );
    }
    return actor;
  }
}
