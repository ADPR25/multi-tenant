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

  @Column({ type: "text" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  orden!: number;

  @Column({ default: true })
  isActive!: boolean;
}