import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { ContractStatus } from "../enums/contract-status.enum";
import { User } from "@/core/iam/users/entities/user.entity";
import { ThirdParty } from "@/modules/third-parties/entities/third-party.entity";

@Entity("hiring_contracts")
@Index(["companyId", "codigo"], { unique: true })
@Index(["companyId", "numeroContrato"])
@Index(["companyId", "thirdPartyId"])
@Index(["companyId", "supervisorId"])
export class Contract extends BaseTenantEntity {
  @Column({ length: 50 })
  codigo!: string;

  @Column({ name: "numero_contrato", length: 100, nullable: true })
  numeroContrato!: string | null;

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

  @Column({ type: "text" })
  objeto!: string;

  @Column({ type: "text", nullable: true })
  observacion!: string | null;

  @Column({ name: "monto_total", type: "decimal", precision: 18, scale: 2 })
  montoTotal!: string;

  @Column({
    name: "monto_primer_pago",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  montoPrimerPago!: string | null;

  @Column({ name: "veces_pagadas", type: "int", default: 1 })
  vecesPagadas!: number;

  @Column({ name: "fecha_inicio", type: "date" })
  fechaInicio!: Date;

  @Column({ name: "fecha_cierre", type: "date", nullable: true })
  fechaCierre!: Date | null;

  @Column({ name: "fecha_primer_pago", type: "date", nullable: true })
  fechaPrimerPago!: Date | null;

  @Column({ name: "duracion", type: "int", nullable: true })
  duracion!: number | null;

  @Column({
    name: "tipo_duracion",
    length: 20,
    nullable: true,
    default: "DIAS",
  })
  tipoDuracion!: string | null;

  @Column({ name: "tipo_contrato", type: "int", default: 1 })
  tipoContrato!: number;

  @Column({ name: "tipo_pago", type: "int", nullable: true })
  tipoPago!: number | null;

  @Column({ name: "formas_pago", type: "text", nullable: true })
  formasPago!: string | null;

  @Column({
    name: "pago_parcial",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  pagoParcial!: string | null;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.EN_ELABORACION,
  })
  estado!: ContractStatus;

  @Column({ name: "estado_firma", length: 30, default: "en_elaboracion" })
  estadoFirma!: string;

  @Column({ type: "text", nullable: true })
  firma!: string | null;

  @Column({ name: "firmado_en", type: "timestamp", nullable: true })
  firmadoEn!: Date | null;

  @Column({ name: "firma_hash", length: 255, nullable: true })
  firmaHash!: string | null;

  @Column({ name: "firma_ip", length: 45, nullable: true })
  firmaIp!: string | null;

  @Column({ name: "firma_metodo", length: 50, default: "electronica_otp" })
  firmaMetodo!: string;

  @Column({ name: "firma_metadata", type: "jsonb", nullable: true })
  firmaMetadata!: Record<string, unknown> | null;

  @Column({ name: "proyecto_nombre", length: 200, nullable: true })
  proyectoNombre!: string | null;

  @Column({ name: "proyecto_id", type: "uuid", nullable: true })
  proyectoId!: string | null;

  @Column({ default: true })
  isActive!: boolean;
}