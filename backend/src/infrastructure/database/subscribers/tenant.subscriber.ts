import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { BaseTenantEntity } from "../base-tenant.entity";
import { BadRequestException } from "@nestjs/common";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface<BaseTenantEntity> {
  listenTo() {
    return BaseTenantEntity;
  }

  private isGlobalEntity(entity: any): boolean {
    if (!entity) return false;
    if (entity.code === "SUPER_ADMIN") return true;
    if (entity.document_number === "00000000") return true;
    return false;
  }

  beforeInsert(event: InsertEvent<BaseTenantEntity>) {
    if (event.metadata.tableName === "sessions") {
      return;
    }

    const entity = event.entity as any;

    if (this.isGlobalEntity(entity) && !entity.companyId) {
      return;
    }

    if (event.metadata.tableName === "role_menus" && !entity.companyId) {
      return;
    }

    if (!entity?.companyId) {
      throw new BadRequestException(
        `TenantSubscriber: companyId es requerido para ${event.metadata.name}`,
      );
    }
  }

  beforeUpdate(event: UpdateEvent<BaseTenantEntity>) {
    if (event.metadata.tableName === "sessions") {
      return;
    }

    const newCompanyId = (event.entity as any)?.companyId;
    const oldCompanyId = event.databaseEntity?.companyId;

    if (newCompanyId && oldCompanyId && newCompanyId !== oldCompanyId) {
      throw new BadRequestException(
        `TenantSubscriber: No puedes mover ${event.metadata.name} de empresa.`,
      );
    }

    if ((newCompanyId && !oldCompanyId) || (!newCompanyId && oldCompanyId)) {
      if (
        !this.isGlobalEntity(event.entity) &&
        !this.isGlobalEntity(event.databaseEntity)
      ) {
        throw new BadRequestException(
          `TenantSubscriber: No puedes cambiar companyId de ${event.metadata.name}`,
        );
      }
    }
  }
}
