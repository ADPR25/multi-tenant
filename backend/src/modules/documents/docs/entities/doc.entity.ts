import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";
import { Folder } from "../../folders/entities/folder.entity";
import { Category } from "../../categories/entities/category.entity";
import { Type } from "../../types/entities/type.entity";

@Entity("documents_docs")
@Index(["companyId", "title"])
export class Doc extends BaseTenantEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "text" })
  fileUrl: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: "bigint", nullable: true })
  size: number;

  @Column({ nullable: true })
  storageKey: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "timestamptz", nullable: true })
  expiresAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Index()
  @Column({ name: "folder_id", type: "uuid" })
  folderId: string;

  @ManyToOne(() => Folder, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "folder_id" })
  folder: Folder;

  @Index()
  @Column({ name: "type_id", type: "uuid" })
  typeId: string;

  @ManyToOne(() => Type, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "type_id" })
  type: Type;

  @Index()
  @Column({ name: "category_id", type: "uuid" })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category: Category;
}
