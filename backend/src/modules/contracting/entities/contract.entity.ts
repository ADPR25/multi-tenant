import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { User } from "@/core/iam/users/entities/user.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from "typeorm";

export enum ThirdPartyType {
  NATURAL = "NATURAL",
  JURIDICA = "JURIDICA",
  EMPLEADO = "EMPLEADO",
}

export enum RiskLevel {
  BAJO = "BAJO",
  MEDIO = "MEDIO",
  ALTO = "ALTO",
}

export enum ContractTypeCode {
  PRESTACION_SERVICIOS = "PRESTACION_SERVICIOS",
  OBRA = "OBRA",
  SUMINISTRO = "SUMINISTRO",
  LABORAL = "LABORAL",
  ARRIENDO = "ARRIENDO",
  OTRO = "OTRO",
}

export enum ContractStatus {
  BORRADOR = "BORRADOR",
  VIGENTE = "VIGENTE",
  POR_VENCER = "POR_VENCER",
  VENCIDO = "VENCIDO",
  LIQUIDADO = "LIQUIDADO",
  TERMINADO = "TERMINADO",
  SUSPENDIDO = "SUSPENDIDO",
}

export enum PaymentTerms {
  MENSUAL = "MENSUAL",
  UNICO = "UNICO",
  POR_HITOS = "POR_HITOS",
  TRIMESTRAL = "TRIMESTRAL",
}

@Entity("contract_third_parties")
@Unique(["companyId", "taxId"])
@Index(["companyId", "isActive"])
export class ContractThirdParty extends BaseTenantEntity {
  @Column({ type: "enum", enum: ThirdPartyType })
  type: ThirdPartyType;

  @Column({ length: 255 })
  name: string;

  @Column({ name: "legal_name", length: 255, nullable: true })
  legalName: string | null;

  @Column({ name: "tax_id", length: 20 })
  taxId: string;

  @Column({ length: 255, nullable: true })
  email: string | null;

  @Column({ length: 50, nullable: true })
  phone: string | null;

  @Column({ length: 255, nullable: true })
  address: string | null;

  @Column({ name: "contact_person", length: 255, nullable: true })
  contactPerson: string | null;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "risk_level", type: "enum", enum: RiskLevel, default: RiskLevel.BAJO })
  riskLevel: RiskLevel;
}

@Entity("contract_types")
@Unique(["companyId", "code"])
export class ContractType extends BaseTenantEntity {
  @Column({ type: "enum", enum: ContractTypeCode })
  code: ContractTypeCode;

  @Column({ length: 100 })
  name: string;

  @Column({ name: "requires_policy", default: false })
  requiresPolicy: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}

@Entity("contracts")
@Unique(["companyId", "contractNumber"])
@Index(["companyId", "status"])
@Index(["companyId", "endDate"])
@Index(["companyId", "thirdPartyId"])
export class Contract extends BaseTenantEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ name: "contract_number", length: 50 })
  contractNumber: string;

  @Column({ name: "contract_type_id", type: "uuid" })
  contractTypeId: string;

  @ManyToOne(() => ContractType, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "contract_type_id" })
  contractType: ContractType;

  @Column({ name: "third_party_id", type: "uuid" })
  thirdPartyId: string;

  @ManyToOne(() => ContractThirdParty, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "third_party_id" })
  thirdParty: ContractThirdParty;

  @Column({ type: "text" })
  object: string;

  @Column({ type: "enum", enum: ContractStatus, default: ContractStatus.BORRADOR })
  status: ContractStatus;

  @Column({ name: "total_value", type: "decimal", precision: 18, scale: 2 })
  totalValue: string;

  @Column({ name: "start_date", type: "date" })
  startDate: string;

  @Column({ name: "end_date", type: "date" })
  endDate: string;

  @Column({ name: "signature_date", type: "date", nullable: true })
  signatureDate: string | null;

  @Column({ name: "payment_terms", type: "enum", enum: PaymentTerms, nullable: true })
  paymentTerms: PaymentTerms | null;

  @Column({ name: "supervisor_id", type: "uuid", nullable: true })
  supervisorId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "supervisor_id" })
  supervisor: User | null;

  @Column({ name: "created_by", type: "uuid" })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "created_by" })
  creator: User;
}