import { BaseEntity } from "@/infrastructure/database/base.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

@Entity("hiring_signature_codes")
@Index(["contractId"])
export class SignatureCode extends BaseEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract?: Contract;

  @Column({ name: "codigo_hash" })
  codigoHash!: string;

  @Column({ default: false })
  usado!: boolean;

  @Column({ default: false })
  verificado!: boolean;

  @Column({ type: "int", default: 0 })
  intentos!: number;

  @Column({ name: "expira_en", type: "timestamp" })
  expiraEn!: Date;

  @Column({ name: "verificado_en", type: "timestamp", nullable: true })
  verificadoEn!: Date | null;

  @Column({ name: "ip_solicitud", nullable: true })
  ipSolicitud!: string | null;

  @Column({ name: "company_id", type: "uuid" })
  companyId!: string;
}