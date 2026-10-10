import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

export enum AddendumType {
  AMENDMENT = "AMENDMENT",
  EXTENSION = "EXTENSION", 
  ADDITION = "ADDITION",
}

@Entity("hiring_addendums")
@Index(["companyId", "contractId"])
@Index(["companyId", "type"])
export class Addendum extends BaseTenantEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column({ name: "type", type: "enum", enum: AddendumType, default: AddendumType.AMENDMENT })
  type!: AddendumType;

  @Column({ name: "description", type: "text" })
  description!: string;

  @Column({ name: "additional_amount", type: "decimal", precision: 18, scale: 2, nullable: true })
  additionalAmount!: string | null;

  @Column({ name: "additional_days", type: "int", nullable: true })
  additionalDays!: number | null;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate!: Date | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}