import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { In, Repository, DataSource } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { Company } from "@/core/tenant/company/entities/company.entity";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { ACCESS_CATALOG } from "@/modules/frontend/data/access.catalog";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private readonly repo: Repository<Permission>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePermissionDto & { companyId: string }) {
    const exists = await this.repo.findOne({
      where: { companyId: dto.companyId, name: dto.name },
    });
    if (exists) throw new ConflictException(`El permiso ${dto.name} ya existe`);
    const perm = this.repo.create(dto);
    return this.repo.save(perm);
  }

  findAll(companyId: string) {
    return this.repo.find({
      where: { companyId },
      order: { module: "ASC", name: "ASC" },
    });
  }

  async findOne(id: string, companyId: string) {
    const perm = await this.repo.findOne({ where: { id, companyId } });
    if (!perm) throw new NotFoundException("Permiso no encontrado");
    return perm;
  }

  async update(id: string, companyId: string, dto: UpdatePermissionDto) {
    const perm = await this.findOne(id, companyId);
    Object.assign(perm, dto);
    return this.repo.save(perm);
  }

  private getAllPermissionNames(): string[] {
    return [
     ...new Set(
        ACCESS_CATALOG.flatMap((m) =>
          m.children
           ? m.children.flatMap((c) => c.permissions?? [])
            : (m.permissions?? []),
        ),
      ),
    ];
  }

  async syncForCompany(companyId: string) {
    const allNames = this.getAllPermissionNames();
    if (!allNames.length) {
      return { total: 0, created: 0, existing: 0, companyId };
    }

    const existing = await this.repo.find({
      where: { companyId, name: In(allNames) },
    });
    const existingNames = new Set(existing.map((p) => p.name));
    const missing = allNames.filter((n) =>!existingNames.has(n));

    if (missing.length) {
      const toCreate = missing.map((name) =>
        this.repo.create({
          companyId,
          name,
          description: name,
          module: name.split(":")[0],
        }),
      );
      await this.repo.save(toCreate);
    }
    return {
      companyId,
      total: allNames.length,
      created: missing.length,
      existing: existing.length,
    };
  }

  async syncAllCompanies() {
    const companyRepo = this.dataSource.getRepository(Company);
    const companies = await companyRepo.find({
      select: ['id'],
    });

    const results = [];
    for (const c of companies) {
      const r = await this.syncForCompany(c.id);
      results.push(r);
    }

    return {
      companiesProcessed: companies.length,
      details: results,
    };
  }
}