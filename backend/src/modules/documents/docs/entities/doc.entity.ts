import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Folder } from "../../folders/entities/folder.entity";
import { Category } from "../../categories/entities/category.entity";
import { Type } from "../../types/entities/type.entity";

@Entity("documents_docs")
export class Doc extends BaseTenantEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "text" })
  fileUrl: string;

  @Column({ default: true })
  isActive: boolean;

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
