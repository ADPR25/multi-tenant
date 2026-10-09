
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

  @Column({ length: 150 })
  nombre!: string; // RUT, Camara Comercio, etc

  @Column({ default: false })
  obligatorio!: boolean;

  @Column({ default: false })
  entregado!: boolean;

  // Referencia al módulo documents (doc.id)
  @Column({ name: "document_id", type: "uuid", nullable: true })
  documentId!: string | null;

  @Column({ type: "text", nullable: true })
  observacion!: string | null;
}
