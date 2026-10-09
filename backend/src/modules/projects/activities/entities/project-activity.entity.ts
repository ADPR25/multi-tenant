import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { ProjectPhase } from "../../phases/entities/project-phase.entity";
import { User } from "@/core/iam/users/entities/user.entity";
import { ProjectStatus } from "../../enums/project-status.enum";

@Entity("project_activities")
@Index(["companyId", "phaseId"])
@Index(["companyId", "projectId"])
export class ProjectActivity extends BaseTenantEntity {
  @Column({ name: "project_id", type: "uuid" }) 
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project?: Project;

  @Column({ name: "phase_id", type: "uuid" }) 
  phaseId!: string;

  @ManyToOne(() => ProjectPhase, { onDelete: "CASCADE" })
  @JoinColumn({ name: "phase_id" })
  phase?: ProjectPhase;

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

  @Column({ name: "responsable_id", type: "uuid", nullable: true })
  responsableId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsable_id" })
  responsable?: User | null;
  
  @Column({ name: "fecha_inicio", type: "date", nullable: true })
  fechaInicio!: Date | null;

  @Column({ name: "fecha_fin", type: "date", nullable: true })
  fechaFin!: Date | null;

  @Column({ type: "int", default: 0 }) 
  avance!: number;
  
  @Column({ default: true }) 
  isActive!: boolean;
}
