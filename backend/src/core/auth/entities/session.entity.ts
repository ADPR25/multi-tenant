import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("sessions")
@Index(["companyId", "userId"])
@Index(["familyId"])
@Index(["expiresAt"])
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @Column({ name: "company_id", type: "uuid", nullable: true })
  @Index()
  companyId: string | null;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  familyId: string;

  @Column()
  refreshTokenHash: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  revokedReason?: string;

  @Column({ type: "uuid", nullable: true })
  replacedById?: string;
}
