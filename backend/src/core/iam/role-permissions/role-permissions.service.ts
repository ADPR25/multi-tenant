import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { RolePermission } from "./entities/role-permission.entity";
import { Role } from "../roles/entities/role.entity";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import { User } from "@/core/iam/users/entities/user.entity";

@Injectable()
export class RolePermissionsService {
  private readonly logger = new Logger(RolePermissionsService.name);
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
    // Si viene de SUPER_ADMIN, obtener companyId del rol
    const role = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { id: roleId } });
    if (!role?.companyId)
      throw new NotFoundException(
        "No se pudo resolver companyId para rol global",
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
    if (exists) throw new ConflictException("Ese permiso ya está asignado");
    const rp = this.repo.create(dto);
    const saved = await this.repo.save(rp);
    await this.clearCache(dto.companyId, dto.roleId);
    return saved;
  }

  async findAll(companyId: string | null, roleId?: string) {
    let effectiveCompanyId = companyId;
    if (!effectiveCompanyId && roleId) {
      effectiveCompanyId = await this.resolveCompanyId(null, roleId).catch(
        () => null as any,
      );
    }
    const where: any = {};
    if (effectiveCompanyId) where.companyId = effectiveCompanyId;
    if (roleId) where.roleId = roleId;
    return this.repo.find({ where, relations: { permission: true } });
  }

  async findOne(id: string, companyId: string) {
    const rp = await this.repo.findOne({
      where: { id, companyId },
      relations: { role: true, permission: true },
    });
    if (!rp) throw new NotFoundException("RolePermission no encontrado");
    return rp;
  }

  async findOneCompat(id: string, companyId: string | null) {
    if (companyId) {
      const rp = await this.repo.findOne({
        where: { id, companyId } as any,
        relations: { permission: true, role: true },
      });
      if (rp) return rp;
    }
    return this.findAll(companyId, id);
  }

  async remove(id: string, companyId: string) {
    const rp = await this.findOne(id, companyId);
    const roleId = rp.roleId;
    const result = await this.repo.softRemove(rp);
    await this.clearCache(companyId, roleId);
    return result;
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
      } as any);
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
