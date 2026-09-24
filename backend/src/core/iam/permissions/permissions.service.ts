import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private readonly repo: Repository<Permission>,
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

  async remove(id: string, companyId: string) {
    const perm = await this.findOne(id, companyId);
    return this.repo.softRemove(perm);
  }
}
