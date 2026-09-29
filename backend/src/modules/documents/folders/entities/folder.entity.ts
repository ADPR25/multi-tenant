import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";

@Entity("documents_folders")
@Index(["companyId", "name"])
export class Folder extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId: string | null;

  @ManyToOne(() => Folder, (folder) => folder.children, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "parent_id" })
  parent: Folder;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];
}
