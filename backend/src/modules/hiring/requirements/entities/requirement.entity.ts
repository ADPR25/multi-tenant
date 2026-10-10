import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

@Entity("hiring_requirements")
@Index(["companyId", "contractId"])
export class Requirement extends BaseTenantEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column({ name: "name", length: 150 })
  name!: string;

  @Column({ name: "is_required", default: false })
  isRequired!: boolean;

  @Column({ name: "is_delivered", default: false })
  isDelivered!: boolean;

  @Column({ name: "document_id", type: "uuid", nullable: true })
  documentId!: string | null;

  @Column({ name: "observation", type: "text", nullable: true })
  observation!: string | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}