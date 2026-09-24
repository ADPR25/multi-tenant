import { Entity, Column, Index } from "typeorm";
import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";

@Entity("sessions")
@Index(["companyId", "userId"])
@Index(["familyId"])
@Index(["expiresAt"])
export class Session extends BaseTenantEntity {
  @Column({ type: "uuid" }) userId: string;
  @Column({ type: "uuid" }) familyId: string;
  @Column() refreshTokenHash: string;
  @Column() expiresAt: Date;
  @Column({ default: false }) revoked: boolean;
  @Column({ nullable: true }) revokedReason?: string;
  @Column({ type: "uuid", nullable: true }) replacedById?: string;
}
