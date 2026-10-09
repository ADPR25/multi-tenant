
import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm";
import { Contract } from "../../contracts/entities/contract.entity";

export enum AddendumType {
  OTROSI = "OTROSI",
  PRORROGA = "PRORROGA",
  ADICION = "ADICION",
}

@Entity("hiring_addendums")
@Index(["companyId", "contractId"])
export class Addendum extends BaseTenantEntity {
  @Column({ name: "contract_id", type: "uuid" })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contract_id" })
  contract!: Contract;

  @Column({ type: "enum", enum: AddendumType, default: AddendumType.OTROSI })
  tipo!: AddendumType;

  @Column({ type: "text" })
  descripcion!: string;

  @Column({ name: "monto_adicional", type: "decimal", precision: 18, scale: 2, nullable: true })
  montoAdicional!: string | null;

  @Column({ name: "dias_adicionales", type: "int", nullable: true })
  diasAdicionales!: number | null;

  @Column({ name: "fecha_inicio", type: "date", nullable: true })
  fechaInicio!: Date | null;
}
