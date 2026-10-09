import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { ProjectPhase } from "../../phases/entities/project-phase.entity";
import { ProjectActivity } from "../../activities/entities/project-activity.entity";
import { User } from "@/core/iam/users/entities/user.entity";
import { TaskStatus, TaskPriority } from "../../enums/task-status.enum";

@Entity("project_tasks")
@Index(["companyId", "activityId"])
@Index(["companyId", "projectId"])
@Index(["companyId", "estado"])
export class ProjectTask extends BaseTenantEntity {
  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project?: Project;

  @Column({ name: "phase_id", type: "uuid", nullable: true })
  phaseId!: string | null;

  @ManyToOne(() => ProjectPhase, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "phase_id" })
  phase?: ProjectPhase | null;

  @Column({ name: "activity_id", type: "uuid" })
  activityId!: string;

  @ManyToOne(() => ProjectActivity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "activity_id" })
  activity?: ProjectActivity;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string | null;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.TODO })
  estado!: TaskStatus;

  @Column({ type: "enum", enum: TaskPriority, default: TaskPriority.MEDIUM })
  prioridad!: TaskPriority;

  @Column({ name: "responsable_id", type: "uuid", nullable: true })
  responsableId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsable_id" })
  responsable?: User | null;

  @Column({ name: "fecha_vencimiento", type: "date", nullable: true })
  fechaVencimiento!: Date | null;

  @Column({
    name: "horas_estimadas",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  horasEstimadas!: string | null;

  @Column({
    name: "horas_reales",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  horasReales!: string | null;

  @Column({ type: "int", default: 0 })
  orden!: number;

  @Column({ default: true })
  isActive!: boolean;
}
