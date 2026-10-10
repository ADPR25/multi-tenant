import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { ProjectStatus } from "../../enums/project-status.enum";

@Entity("project_phases")
@Index(["companyId", "projectId", "code"], { unique: true })
@Index(["companyId", "projectId"])
@Index(["companyId", "status"])
export class ProjectPhase extends BaseTenantEntity {
  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project?: Project;

  @Column({ name: "code", length: 50 })
  code!: string;

  @Column({ name: "name", length: 200 })
  name!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @Column({
    name: "status",
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status!: ProjectStatus;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate!: Date | null;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate!: Date | null;

  @Column({ name: "progress", type: "int", default: 0 })
  progress!: number;

  @Column({
    name: "budget",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  budget!: string | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}