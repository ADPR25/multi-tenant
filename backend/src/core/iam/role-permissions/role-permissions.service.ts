import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { RolePermission } from "./entities/role-permission.entity";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import { UpdateRolePermissionDto } from "./dto/update-role-permission.dto";
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

    try {
      const users = await this.repo.manager.find(User, {
        where: { companyId, roleId },
        select: {id: true},
      });

      if (users.length > 0) {
        await Promise.all(
          users.map((u) => this.cacheManager.del(`auth:${u.id}:${companyId}`))
        );
      }

      this.logger.log(
        `Cache invalidado perms:${companyId}:${roleId} + ${users.length} auth keys`
      );
    } catch (e) {
      this.logger.warn(`Fallo al invalidar cache de auth para rol ${roleId}`, e);
    }
  }

  async create(dto: CreateRolePermissionDto & { companyId: string }) {
    const exists = await this.repo.findOne({
      where: {
        companyId: dto.companyId,
        roleId: dto.roleId,
        permissionId: dto.permissionId,
      },
    });
    if (exists)
      throw new ConflictException("Ese permiso ya está asignado a ese rol");
    const rp = this.repo.create(dto);
    const saved = await this.repo.save(rp);
    await this.clearCache(dto.companyId, dto.roleId);
    return saved;
  }

  findAll(companyId: string, roleId?: string) {
    return this.repo.find({
      where: { companyId,...(roleId && { roleId }) },
      relations: { permission: true },
    });
  }

  async findOne(id: string, companyId: string) {
    const rp = await this.repo.findOne({
      where: { id, companyId },
      relations: { role: true, permission: true },
    });
    if (!rp) throw new NotFoundException("RolePermission no encontrado");
    return rp;
  }

  async update(id: string, companyId: string, dto: UpdateRolePermissionDto) {
    const rp = await this.findOne(id, companyId);
    Object.assign(rp, dto);
    const saved = await this.repo.save(rp);
    await this.clearCache(companyId, rp.roleId);
    return saved;
  }

  async remove(id: string, companyId: string) {
    const rp = await this.findOne(id, companyId);
    const roleId = rp.roleId;
    const result = await this.repo.softRemove(rp);
    await this.clearCache(companyId, roleId);
    return result;
  }

  async syncRolePermissions(
    companyId: string,
    roleId: string,
    permissions: CreateRolePermissionDto[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(RolePermission, { companyId, roleId });
      const toCreate = queryRunner.manager.create(
        RolePermission,
        permissions.map((p) => ({...p, companyId, roleId })),
      );
      const saved = await queryRunner.manager.save(toCreate);
      await queryRunner.commitTransaction();
      await this.clearCache(companyId, roleId);
      return saved;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}