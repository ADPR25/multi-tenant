import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity("documents_types")
export class Type extends BaseTenantEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  isActive: boolean;
}
