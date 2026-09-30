import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm";

@Entity("documents_folders")
@Index(["companyId", "name", "parentId"], { unique: true })
export class Folder extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId: string | null;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "parent_id" })
  parent: Folder;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];

  @Column({ name: "owner_folder_name", nullable: true })
  ownerFolderName: string | null;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null;
}