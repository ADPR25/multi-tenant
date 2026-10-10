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
@Index(["companyId", "status"])
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

  @Column({ name: "title", length: 200 })
  title!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "status", type: "enum", enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ name: "priority", type: "enum", enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ name: "responsible_id", type: "uuid", nullable: true })
  responsibleId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsible_id" })
  responsible?: User | null;

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate!: Date | null;

  @Column({
    name: "estimated_hours",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  estimatedHours!: string | null;

  @Column({
    name: "actual_hours",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  actualHours!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}