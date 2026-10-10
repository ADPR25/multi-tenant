import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

@Entity("hiring_obligations")
@Index(["companyId", "contractId"])
export class ContractObligation extends BaseTenantEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column({ name: "description", type: "text" })
  description!: string;

  @Column({ name: "sort_order", type: "int", default: 1 })
  sortOrder!: number;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}