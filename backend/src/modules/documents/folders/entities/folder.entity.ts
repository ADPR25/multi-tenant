import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("documents_folders")
export class Folder extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  parentId: string | null;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Folder;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];
}