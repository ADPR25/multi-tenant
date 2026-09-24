import { Entity, Column } from "typeorm";
import { BaseEntity } from "@/infrastructure/database/base.entity";

@Entity("companies")
export class Company extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  legal_name: string;

  @Column({ type: "smallint" })
  document_type: number;

  @Column({ length: 30, unique: true })
  tax_id: string;

  @Column({ length: 75 })
  email: string;

  @Column({ length: 25 })
  phone: string;

  @Column({ length: 200 })
  address: string;

  @Column({ default: true })
  isActive: boolean
}