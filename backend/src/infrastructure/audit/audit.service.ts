import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";

interface CreateAuditLogData {
  companyId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(data: CreateAuditLogData) {
    try {
      const log = this.repo.create(data);
      await this.repo.save(log);
    } catch (error) {
      this.logger.error(
        `Fallo al guardar audit log para ${data.resource}`,
        error as Error,
      );
    }
  }
}
