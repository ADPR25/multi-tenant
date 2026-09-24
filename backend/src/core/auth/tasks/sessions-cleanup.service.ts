import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Session } from "../entities/session.entity";

@Injectable()
export class SessionsCleanupService {
  private readonly logger = new Logger(SessionsCleanupService.name);
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
  ) {}

  @Cron("0 */6 * * *")
  async cleanup() {
    const result = await this.sessionRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Sesiones expiradas eliminadas: ${result.affected}`);
  }
}
