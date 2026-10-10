import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";
import { ThirdPartyType } from "../enums/third-party-type.enum";
import { ThirdPartyPersonType } from "../enums/third-party-person-type.enum";

@Entity("third_parties")
@Index(["companyId", "taxId"], { unique: true })
@Index(["companyId", "type"])
export class ThirdParty extends BaseTenantEntity {
  @Column({ name: "tax_id", length: 20 })
  taxId!: string;

  @Column({ name: "verification_digit", length: 5, nullable: true })
  verificationDigit!: string | null;

  @Column({ name: "legal_name", length: 200 })
  legalName!: string;

  @Column({ name: "trade_name", length: 200, nullable: true })
  tradeName!: string | null;

  @Column({ name: "type", type: "enum", enum: ThirdPartyType, default: ThirdPartyType.CONTRACTOR })
  type!: ThirdPartyType;

  @Column({ name: "person_type", type: "enum", enum: ThirdPartyPersonType, default: ThirdPartyPersonType.LEGAL_ENTITY })
  personType!: ThirdPartyPersonType;

  @Column({ name: "email", length: 150, nullable: true })
  email!: string | null;

  @Column({ name: "phone", length: 30, nullable: true })
  phone!: string | null;

  @Column({ name: "city", length: 100, nullable: true })
  city!: string | null;

  @Column({ name: "address", length: 100, nullable: true })
  address!: string | null;

  @Column({ name: "bank_name", length: 100, nullable: true })
  bankName!: string | null;

  @Column({ name: "bank_account_type", length: 20, nullable: true })
  bankAccountType!: string | null; 

  @Column({ name: "bank_account_number", length: 50, nullable: true })
  bankAccountNumber!: string | null;

  @Column({ name: "economic_activity", length: 20, nullable: true })
  economicActivity!: string | null;

  @Column({ name: "is_vat_responsible", type: "boolean", default: false })
  isVatResponsible!: boolean;

  @Column({ name: "notes", type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;
}