import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ProjectStatus } from "../../enums/project-status.enum";
import { ThirdParty } from "@/modules/third-parties/entities/third-party.entity";
import { User } from "@/core/iam/users/entities/user.entity";

@Entity("projects")
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "status"])
export class Project extends BaseTenantEntity {
  @Column({ name: "code", length: 50 })
  code!: string;

  @Column({ name: "name", length: 200 })
  name!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

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

  @Column({
    name: "budget",
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  budget!: string | null;

  @Column({ name: "progress", type: "int", default: 0 })
  progress!: number;

  @Column({ name: "client_id", type: "uuid", nullable: true })
  clientId!: string | null;

  @ManyToOne(() => ThirdParty, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "client_id" })
  client?: ThirdParty | null;

  @Column({ name: "responsible_id", type: "uuid", nullable: true })
  responsibleId!: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "responsible_id" })
  responsible?: User | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}