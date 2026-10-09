import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";
import { ThirdPartyType } from "../enums/third-party-type.enum";
import { ThirdPartyPersonType } from "../enums/third-party-person-type.enum";

@Entity("third_parties")
@Index(["companyId", "nit"], { unique: true })
@Index(["companyId", "tipo"])
export class ThirdParty extends BaseTenantEntity {
  @Column({ length: 20 })
  nit!: string;

  @Column({ length: 5, nullable: true })
  dv!: string | null;

  @Column({ name: "razon_social", length: 200 })
  razonSocial!: string;

  @Column({ name: "nombre_comercial", length: 200, nullable: true })
  nombreComercial!: string | null;

  @Column({ type: "enum", enum: ThirdPartyType, default: ThirdPartyType.CONTRATISTA })
  tipo!: ThirdPartyType;

  @Column({ name: "tipo_persona", type: "enum", enum: ThirdPartyPersonType, default: ThirdPartyPersonType.JURIDICA })
  tipoPersona!: ThirdPartyPersonType;

  @Column({ length: 150, nullable: true })
  email!: string | null;

  @Column({ length: 30, nullable: true })
  telefono!: string | null;

  @Column({ length: 100, nullable: true })
  ciudad!: string | null;

  @Column({ length: 100, nullable: true })
  direccion!: string | null;

  @Column({ length: 100, nullable: true })
  banco!: string | null;

  @Column({ name: "tipo_cuenta", length: 20, nullable: true })
  tipoCuenta!: string | null; 

  @Column({ name: "cuenta_bancaria", length: 50, nullable: true })
  cuentaBancaria!: string | null;

  @Column({ name: "actividad_economica", length: 20, nullable: true })
  actividadEconomica!: string | null;

  @Column({ name: "responsable_iva", type: "boolean", default: false })
  responsableIva!: boolean;

  @Column({ type: "text", nullable: true })
  notas!: string | null;

  @Column({ default: true })
  isActive!: boolean;
}
