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

  beforeInsert(event: InsertEvent<BaseTenantEntity>) {
    if (!event.entity?.companyId) {
      throw new BadRequestException(
        `TenantSubscriber: Intento de crear ${event.metadata.name} sin companyId. Fuga de datos evitada.`,
      );
    }
  }

  beforeUpdate(event: UpdateEvent<BaseTenantEntity>) {
    const newCompanyId = (event.entity as any)?.companyId;
    const oldCompanyId = event.databaseEntity?.companyId;

    if (newCompanyId && oldCompanyId && newCompanyId !== oldCompanyId) {
      throw new BadRequestException(
        `TenantSubscriber: No puedes mover ${event.metadata.name} de empresa.`,
      );
    }
  }
}
