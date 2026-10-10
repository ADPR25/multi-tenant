import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "../../projects/entities/project.entity";

@Entity("surveys")
export class Survey extends BaseTenantEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "jsonb" })
  survey: Record<string, unknown>;

  @Column({ type: "timestamptz" })
  endDate: Date;

  @Index()
  @Column({ name: "project_id", type: "uuid", nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "project_id" })
  Project?: Project | null;
}
