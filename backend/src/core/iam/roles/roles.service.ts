import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Role } from "./entities/role.entity";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { normalizeRoleCode } from "./utils/role-code.util";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  private getCode(dto: { name?: string; code?: string }): string {
    const raw = dto.code || dto.name || "";
    return normalizeRoleCode(raw);
  }

  async create(dto: CreateRoleDto & { companyId: string }) {
    return this.dataSource.transaction(async (manager) => {
      const code = this.getCode(dto);
      if (!code) throw new ConflictException("Role code is not valid");

      const exists = await manager.findOne(Role, {
        where: [
          { companyId: dto.companyId, name: dto.name },
          { companyId: dto.companyId, code },
        ],
      });
      if (exists)
        throw new ConflictException(`Role ${dto.name} / ${code} already exists`);

      if (dto.isPrincipal) {
        await manager.update(
          Role,
          { companyId: dto.companyId, isPrincipal: true },
          { isPrincipal: false },
        );
      }

      const role = manager.create(Role, {
        ...dto,
        code,
        name: dto.name.trim(),
      });
      return manager.save(role);
    });
  }

  async findAll(companyId: string, pagination?: PaginationDto) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const role = await this.repo.findOne({ where: { id, companyId } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async update(id: string, companyId: string, dto: UpdateRoleDto) {
    return this.dataSource.transaction(async (manager) => {
      const role = await manager.findOne(Role, { where: { id, companyId } });
      if (!role) throw new NotFoundException(`Role ${id} not found`);

      if (dto.name || dto.code) {
        const newCode = this.getCode({
          name: dto.name ?? role.name,
          code: dto.code ?? dto.name ?? role.name,
        });
        const conflict = await manager.findOne(Role, {
          where: { companyId, code: newCode },
        });
        if (conflict && conflict.id !== id) {
          throw new ConflictException(`Code ${newCode} already exists`);
        }
        role.code = newCode;
      }

      if (dto.isPrincipal) {
        await manager.update(
          Role,
          { companyId, isPrincipal: true },
          { isPrincipal: false },
        );
      }

      Object.assign(role, {
        ...dto,
        ...(dto.name ? { name: dto.name.trim() } : {}),
      });
      return manager.save(role);
    });
  }

  async ensureSuperAdminRole(companyId: string): Promise<Role> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Role, {
        where: { companyId, code: "SUPER_ADMIN" },
      });
      if (existing) return existing;

      await manager.update(
        Role,
        { companyId, isPrincipal: true },
        { isPrincipal: false },
      );

      const superAdmin = manager.create(Role, {
        companyId,
        name: "SUPER ADMIN",
        code: "SUPER_ADMIN",
        description: "Role with full system access",
        isPrincipal: true,
        isActive: true,
      });
      return manager.save(superAdmin);
    });
  }

  async toggleActive(id: string, companyId: string) {
    const role = await this.findOne(id, companyId);
    role.isActive = !role.isActive;
    return this.repo.save(role);
  }
}