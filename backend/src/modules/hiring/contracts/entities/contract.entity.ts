import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { ContractStatus } from "../enums/contract-status.enum";
import { User } from "@/core/iam/users/entities/user.entity";
import { ThirdParty } from "@/modules/third-parties/entities/third-party.entity";

@Entity("hiring_contracts")
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "contractNumber"])
@Index(["companyId", "thirdPartyId"])
@Index(["companyId", "supervisorId"])
export class Contract extends BaseTenantEntity {
  @Column({ name: "code", length: 50 })
  code!: string;

  @Column({ name: "contract_number", length: 100, nullable: true })
  contractNumber!: string | null;

  @Column({ name: "third_party_id", type: "uuid" })
  thirdPartyId!: string;

  @ManyToOne(() => ThirdParty, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "third_party_id" })
  thirdParty?: ThirdParty;

  @Column({ name: "supervisor_id", type: "uuid", nullable: true })
  supervisorId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "supervisor_id" })
  supervisor?: User;

  @Column({ name: "purpose", type: "text" })
  purpose!: string;

  @Column({ name: "observation", type: "text", nullable: true })
  observation!: string | null;

  @Column({ name: "total_amount", type: "decimal", precision: 18, scale: 2 })
  totalAmount!: string;

  @Column({
    name: "first_payment_amount",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  firstPaymentAmount!: string | null;

  @Column({ name: "times_paid", type: "int", default: 1 })
  timesPaid!: number;

  @Column({ name: "start_date", type: "date" })
  startDate!: Date;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate!: Date | null;

  @Column({ name: "first_payment_date", type: "date", nullable: true })
  firstPaymentDate!: Date | null;

  @Column({ name: "duration", type: "int", nullable: true })
  duration!: number | null;

  @Column({
    name: "duration_type",
    length: 20,
    nullable: true,
    default: "DAYS",
  })
  durationType!: string | null;

  @Column({ name: "contract_type", type: "int", default: 1 })
  contractType!: number;

  @Column({ name: "payment_type", type: "int", nullable: true })
  paymentType!: number | null;

  @Column({ name: "payment_methods", type: "text", nullable: true })
  paymentMethods!: string | null;

  @Column({
    name: "partial_payment",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  partialPayment!: string | null;

  @Column({
    name: "status",
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status!: ContractStatus;

  @Column({ name: "signature_status", length: 30, default: "draft" })
  signatureStatus!: string;

  @Column({ name: "signature", type: "text", nullable: true })
  signature!: string | null;

  @Column({ name: "signed_at", type: "timestamp", nullable: true })
  signedAt!: Date | null;

  @Column({ name: "signature_hash", length: 255, nullable: true })
  signatureHash!: string | null;

  @Column({ name: "signature_ip", length: 45, nullable: true })
  signatureIp!: string | null;

  @Column({ name: "signature_method", length: 50, default: "electronic_otp" })
  signatureMethod!: string;

  @Column({ name: "signature_metadata", type: "jsonb", nullable: true })
  signatureMetadata!: Record<string, unknown> | null;

  @Column({ name: "project_name", length: 200, nullable: true })
  projectName!: string | null;

  @Column({ name: "project_id", type: "uuid", nullable: true })
  projectId!: string | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}