import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ProjectStatus } from "../../enums/project-status.enum";
import { ThirdParty } from "@/modules/third-parties/entities/third-party.entity";
import { User } from "@/core/iam/users/entities/user.entity";

@Entity("projects")
@Index(["companyId", "codigo"], { unique: true })
@Index(["companyId", "estado"])
export class Project extends BaseTenantEntity {
  @Column({ length: 50 })
  codigo!: string;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string | null;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.EN_PLANEACION,
  })
  estado!: ProjectStatus;

  @Column({ name: "fecha_inicio", type: "date", nullable: true })
  fechaInicio!: Date | null;

  @Column({ name: "fecha_fin", type: "date", nullable: true })
  fechaFin!: Date | null;

  @Column({
    name: "presupuesto",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  presupuesto!: string | null;

  @Column({ type: "int", default: 0 })
  avance!: number;

  @Column({ name: "cliente_id", type: "uuid", nullable: true })
  clienteId!: string | null;

  @ManyToOne(() => ThirdParty, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "cliente_id" })
  cliente?: ThirdParty | null;

  @Column({ name: "responsable_id", type: "uuid", nullable: true })
  responsableId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsable_id" })
  responsable?: User | null;

  @Column({ default: true })
  isActive!: boolean;
}
