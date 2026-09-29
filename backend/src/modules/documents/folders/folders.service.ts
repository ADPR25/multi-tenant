import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Folder } from "./entities/folder.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private readonly repo: Repository<Folder>,
  ) {}

  async create(dto: CreateFolderDto, companyId: string) {
    if (dto.parentId) {
      const parent = await this.repo.findOne({
        where: { id: dto.parentId, companyId },
      });
      if (!parent)
        throw new NotFoundException(`Carpeta padre ${dto.parentId} no existe`);
    }
    const data = this.repo.create({ ...dto, companyId });
    return this.repo.save(data);
  }

  async findAll(companyId: string, pagination: PaginationDto, state: boolean) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const folder = await this.repo.findOne({ where: { id, companyId } });
    if (!folder) throw new NotFoundException(`folder ${id} not found`);
    return folder;
  }

  async update(id: string, companyId: string, dto: UpdateFolderDto) {
    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException("Una carpeta no puede ser su propio padre");
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
