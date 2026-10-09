import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { ProjectStatus } from "../../enums/project-status.enum";

@Entity("project_phases")
@Index(["companyId", "projectId", "codigo"], { unique: true })
@Index(["companyId", "projectId"])
export class ProjectPhase extends BaseTenantEntity {
  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project?: Project;

  @Column({ length: 50 })
  codigo!: string;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string | null;

  @Column({ type: "int", default: 0 })
  orden!: number;

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

  @Column({ type: "int", default: 0 })
  avance!: number;

  @Column({
    name: "presupuesto",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  presupuesto!: string | null;

  @Column({ default: true })
  isActive!: boolean;
}
