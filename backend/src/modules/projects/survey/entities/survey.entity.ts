import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("surveys")
export class Survey extends BaseTenantEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "jsonb" })
  survey: Record<string, unknown>;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 10, unique: true })
  code: string;

  @Column({ type: "timestamptz" })
  endDate: Date;
}