import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('company_settings')
export class CompanySetting extends BaseTenantEntity {
  @Column({ length: 20 })
  language: string;

  @Column({ length: 100 })
  logoUrl: string;

  @Column({ length: 50 })
  currency: string;

  @Column({ nullable: true })
  driveType: number;
}
