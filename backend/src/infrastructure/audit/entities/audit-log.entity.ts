import { Entity, Column, Index } from "typeorm";
import { BaseTenantEntity } from "../../database/base-tenant.entity";

@Entity("audit_logs")
@Index(["companyId", "createdAt"])
export class AuditLog extends BaseTenantEntity {
  @Column({ type: "uuid", nullable: true })
  userId: string;

  @Column()
  action: string; 

  @Column()
  resource: string;

  @Column({ type: "uuid", nullable: true })
  resourceId: string;

  @Column({ type: "jsonb", nullable: true })
  details: any;
}
