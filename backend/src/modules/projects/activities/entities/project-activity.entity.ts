import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";
import { ProjectPhase } from "../../phases/entities/project-phase.entity";
import { User } from "@/core/iam/users/entities/user.entity";
import { ProjectStatus } from "../../enums/project-status.enum";

@Entity("project_activities")
@Index(["companyId", "phaseId"])
@Index(["companyId", "projectId"])
@Index(["companyId", "status"])
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

  @Column({ name: "responsible_id", type: "uuid", nullable: true })
  responsibleId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsible_id" })
  responsible?: User | null;
  
  @Column({ name: "start_date", type: "date", nullable: true })
  startDate!: Date | null;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate!: Date | null;

  @Column({ name: "progress", type: "int", default: 0 }) 
  progress!: number;
  
  @Column({ name: "is_active", default: true }) 
  isActive!: boolean;
}