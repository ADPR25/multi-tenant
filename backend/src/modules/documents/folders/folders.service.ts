import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Folder } from "./entities/folder.entity";
import { Repository, IsNull, Raw } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { UsersService } from "@/core/iam/users/users.service";
import { FilterDto } from "@/common/filters/filter.dto";

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private readonly repo: Repository<Folder>,
    private readonly userService: UsersService,
  ) {}

  async create(dto: CreateFolderDto, companyId: string, userId?: string) {
    if (dto.parentId) {
      const parent = await this.repo.findOne({
        where: { id: dto.parentId, companyId, isActive: true },
      });
      if (!parent)
        throw new NotFoundException(`Carpeta padre ${dto.parentId} no existe`);
    }
    const data = this.repo.create({
      ...dto,
      companyId,
      createdBy: userId,
    } as any);
    return this.repo.save(data);
  }

  async createPersonal(parentId: string, companyId: string, user: any) {
    const UserSelected = await this.userService.findOne(
      user.id || user.sub || user.userId,
      companyId,
    );

    const fullName =
      `${UserSelected.first_name} ${UserSelected.last_name}`.trim();

    const exists = await this.repo.findOne({
      where: { companyId, parentId, name: fullName },
    });
    if (exists) throw new ConflictException(`Ya tienes tu carpeta ${fullName}`);

    const data = this.repo.create({
      name: fullName,
      description: `Documentos de ${fullName}`,
      parentId,
      companyId,
      ownerFolderName: fullName,
      createdBy: UserSelected.id,
    });
    return this.repo.save(data);
  }

  async findAll(
    companyId: string,
    pagination: FilterDto,
    state?: boolean,
    find?: string,
  ) {
    const isList = find === "list" || find?.includes("list");

    const where: any = {
      companyId,
      ...(state !== undefined ? { isActive: state } : {}),
    };

    if (isList) {
      where.ownerFolderName = Raw(
        (alias) => `(${alias} IS NULL OR ${alias} = '')`,
      );
    }

    if (pagination.parentId !== undefined) {
      where.parentId =
        pagination.parentId === null ||
        pagination.parentId === "null" ||
        pagination.parentId === ""
          ? IsNull()
          : pagination.parentId;
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: { parent: true },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });

    const mapped = data.map((f: any) => ({
      id: f.id,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      companyId: f.companyId,
      name: f.name,
      description: f.description,
      isActive: f.isActive,
      parentId: f.parentId,
      parentName: f.parent?.name || null,
      ownerFolderName: f.ownerFolderName,
      createdBy: f.createdBy,
    }));

    return paginatedResponse(mapped, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const folder = await this.repo.findOne({ where: { id, companyId } });
    if (!folder) throw new NotFoundException(`folder ${id} not found`);
    return folder;
  }

  private async isDescendant(
    potentialParentId: string,
    childId: string,
    companyId: string,
  ): Promise<boolean> {
    let currentId = potentialParentId;
    for (let i = 0; i < 20; i++) {
      if (!currentId) return false;
      if (currentId === childId) return true;
      const parent = await this.repo.findOne({
        where: { id: currentId, companyId },
      });
      if (!parent) return false;
      currentId = parent.parentId;
    }
    return false;
  }

  async update(id: string, companyId: string, dto: UpdateFolderDto) {
    if (dto.parentId) {
      if (dto.parentId === id)
        throw new BadRequestException(
          "Una carpeta no puede ser su propio padre",
        );
      const willBeCycle = await this.isDescendant(dto.parentId, id, companyId);
      if (willBeCycle) throw new BadRequestException("Ciclo detectado");
      const parent = await this.repo.findOne({
        where: { id: dto.parentId, companyId },
      });
      if (!parent)
        throw new NotFoundException(`Carpeta padre ${dto.parentId} no existe`);
    }
    const folder = await this.findOne(id, companyId);
    Object.assign(folder, dto);
    return this.repo.save(folder);
  }

  async toggleActive(id: string, companyId: string) {
    const folder = await this.findOne(id, companyId);
    folder.isActive = !folder.isActive;
    return this.repo.save(folder);
  }
}
