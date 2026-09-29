import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('documents_categories')
export class Category extends BaseTenantEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
