import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Company } from "./entities/company.entity";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CompanySetting } from "../company-settings/entities/company-setting.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateCompanyDto) {
    const exists = await this.companyRepo.findOne({
      where: { tax_id: dto.tax_id },
    });
    if (exists)
      throw new ConflictException(`Empresa con NIT ${dto.tax_id} ya existe`);

    return this.dataSource.transaction(async (manager) => {
      const company = manager.create(Company, dto);
      const savedCompany = await manager.save(company);
      const settings = manager.create(CompanySetting, {
        companyId: savedCompany.id,
        language: "es",
        currency: "COP",
        logoUrl: "",
      });
      await manager.save(settings);

      return savedCompany;
    });
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await this.companyRepo.findAndCount({
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string) {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException(`Company ${id} no existe`);
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async remove(id: string) {
    const company = await this.findOne(id);
    return this.companyRepo.softRemove(company);
  }
}
