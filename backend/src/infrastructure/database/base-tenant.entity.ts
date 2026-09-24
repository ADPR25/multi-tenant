import { Company } from "@/core/tenant/company/entities/company.entity";
import { Index, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";

export abstract class BaseTenantEntity extends BaseEntity {
  @Index()
  @Column({ name: "company_id", type: "uuid" })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "company_id" })
  company?: Company | null;
}