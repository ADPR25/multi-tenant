import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateDocDto } from "./dto/create-doc.dto";
import { UpdateDocDto } from "./dto/update-doc.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Doc } from "./entities/doc.entity";
import { Folder } from "../folders/entities/folder.entity";
import { Category } from "../categories/entities/category.entity";
import { Type } from "../types/entities/type.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Doc) private readonly repoService: Repository<Doc>,
    @InjectRepository(Folder) private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Type) private readonly typeRepo: Repository<Type>,
  ) {}

  private async validateRelations(
    dto: CreateDocDto | UpdateDocDto,
    companyId: string,
  ) {
    if (dto.folderId) {
      const f = await this.folderRepo.findOne({
        where: { id: dto.folderId, companyId, isActive: true },
      });
      if (!f)
        throw new BadRequestException(
          `Folder ${dto.folderId} no existe o inactivo`,
        );
    }
    if (dto.categoryId) {
      const c = await this.categoryRepo.findOne({
        where: { id: dto.categoryId, companyId, isActive: true },
      });
      if (!c)
        throw new BadRequestException(
          `Category ${dto.categoryId} no existe o inactivo`,
        );
    }
    if (dto.typeId) {
      const t = await this.typeRepo.findOne({
        where: { id: dto.typeId, companyId, isActive: true },
      });
      if (!t)
        throw new BadRequestException(
          `Type ${dto.typeId} no existe o inactivo`,
        );
    }
  }

  async create(createDocDto: CreateDocDto, companyId: string) {
    await this.validateRelations(createDocDto, companyId);
    const data = this.repoService.create({ ...createDocDto, companyId });
    return this.repoService.save(data);
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      relations: ["folder", "category", "type"],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const doc = await this.repoService.findOne({
      where: { id, companyId },
      relations: ["folder", "category", "type"],
    });
    if (!doc) throw new NotFoundException(`doc ${id} not found`);
    return doc;
  }

  async update(id: string, updateDocDto: UpdateDocDto, companyId: string) {
    await this.validateRelations(updateDocDto, companyId);
    const doc = await this.findOne(id, companyId);
    Object.assign(doc, updateDocDto);
    return this.repoService.save(doc);
  }

  async toggleActive(id: string, companyId: string) {
    const doc = await this.findOne(id, companyId);
    doc.isActive = !doc.isActive;
    return this.repoService.save(doc);
  }
}
