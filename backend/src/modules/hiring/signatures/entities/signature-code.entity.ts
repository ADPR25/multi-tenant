import { BaseEntity } from "@/infrastructure/database/base.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

@Entity("hiring_signature_codes")
@Index(["contractId"])
@Index(["companyId"])
@Index(["expiresAt"])
export class SignatureCode extends BaseEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract?: Contract;

  @Column({ name: "code_hash", length: 255 })
  codeHash!: string;

  @Column({ name: "is_used", default: false })
  isUsed!: boolean;

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  @Column({ name: "attempts", type: "int", default: 0 })
  attempts!: number;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt!: Date;

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt!: Date | null;

  @Column({ name: "request_ip", length: 45, nullable: true })
  requestIp!: string | null;

  @Column({ name: "company_id", type: "uuid" })
  companyId!: string;
}