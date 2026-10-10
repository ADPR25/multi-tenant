import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, FindOptionsWhere } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { RolePermission } from "./entities/role-permission.entity";
import { Role } from "../roles/entities/role.entity";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repo: Repository<RolePermission>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearCache(companyId: string, roleId: string) {
    await this.cacheManager.del(`perms:${companyId}:${roleId}`);
  }

  private async resolveCompanyId(
    companyId: string | null,
    roleId: string,
  ): Promise<string> {
    if (companyId) return companyId;
    const role = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { id: roleId } });
    if (!role?.companyId)
      throw new NotFoundException(
        "Could not resolve companyId for global role",
      );
    return role.companyId;
  }

  async create(dto: CreateRolePermissionDto & { companyId: string }) {
    const exists = await this.repo.findOne({
      where: {
        companyId: dto.companyId,
        roleId: dto.roleId,
        permissionId: dto.permissionId,
      },
    });
    if (exists) throw new ConflictException("This permission is already assigned");
    const rp = this.repo.create(dto);
    const saved = await this.repo.save(rp);
    await this.clearCache(dto.companyId, dto.roleId);
    return saved;
  }

  async findAll(companyId: string | null, roleId?: string) {
    let effectiveCompanyId: string | null = companyId;
    if (!effectiveCompanyId && roleId) {
      try {
        effectiveCompanyId = await this.resolveCompanyId(null, roleId);
      } catch {
        effectiveCompanyId = null;
      }
    }
    const where: FindOptionsWhere<RolePermission> = {};
    if (effectiveCompanyId) where.companyId = effectiveCompanyId;
    if (roleId) where.roleId = roleId;
    return this.repo.find({ where, relations: { permission: true } });
  }

  async findOne(id: string, companyId: string) {
    const rp = await this.repo.findOne({
      where: { id, companyId },
      relations: { role: true, permission: true },
    });
    if (!rp) throw new NotFoundException(`RolePermission ${id} not found`);
    return rp;
  }

  async findOneCompat(id: string, companyId: string | null) {
    if (companyId) {
      const rp = await this.repo.findOne({
        where: { id, companyId },
        relations: { permission: true, role: true },
      });
      if (rp) return rp;
    }
    return this.findAll(companyId, id);
  }

  async syncRolePermissions(
    companyId: string | null,
    roleId: string,
    permissionIds: string[],
  ) {
    const effectiveCompanyId = await this.resolveCompanyId(companyId, roleId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(RolePermission, {
        companyId: effectiveCompanyId,
        roleId,
      });

      if (permissionIds.length) {
        const toCreate = queryRunner.manager.create(
          RolePermission,
          permissionIds.map((pid) => ({
            companyId: effectiveCompanyId,
            roleId,
            permissionId: pid,
          })),
        );
        await queryRunner.manager.save(toCreate);
      }
      await queryRunner.commitTransaction();
      await this.clearCache(effectiveCompanyId, roleId);
      return this.findAll(effectiveCompanyId, roleId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}