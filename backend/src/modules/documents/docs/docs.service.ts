import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { UploadsService } from "@/modules/uploads/uploads.service";
import { CurrentUserPayload } from "@/common/decorators/current-company.decorator";
import { Express } from "express";
import { FilterDto } from "@/common/filters/filter.dto";

type DocsFilterDto = PaginationDto & FilterDto;

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Doc) private readonly repoService: Repository<Doc>,
    @InjectRepository(Folder) private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Type) private readonly typeRepo: Repository<Type>,
    private readonly uploadsService: UploadsService,
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

  async create(createDocDto: CreateDocDto, companyId: string, userId?: string) {
    await this.validateRelations(createDocDto, companyId);
    const data = this.repoService.create({
      ...createDocDto,
      companyId,
      createdBy: userId,
    });
    return this.repoService.save(data);
  }

  async createWithFile(
    dto: CreateDocDto,
    companyId: string,
    user: CurrentUserPayload,
    file?: Express.Multer.File,
  ) {
    await this.validateRelations(dto, companyId);
    const folder = await this.folderRepo.findOne({
      where: { id: dto.folderId, companyId },
    });
    if (!folder) throw new NotFoundException("Carpeta no encontrada");

    const effectiveUserId = user.id || user.sub;
    if (!effectiveUserId)
      throw new BadRequestException("Usuario no identificado");

    if (folder.ownerFolderName) {
      if (folder.createdBy && folder.createdBy !== effectiveUserId) {
        throw new ForbiddenException(
          "No puedes subir en carpeta de otro compañero",
        );
      }
    }

    let fileData: ReturnType<UploadsService["saveFile"]> | null = null;
    if (file) {
      fileData = this.uploadsService.saveFile(companyId, dto.folderId, file);
    }

    const ownerName =
      folder.ownerFolderName ||
      `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
      null;

    const dataToCreate = {
      ...dto,
      companyId,
      createdBy: effectiveUserId,
      fileName: fileData?.originalName ?? file?.originalname,
      storageKey: fileData?.storageKey,
      mimeType: fileData?.mimeType ?? file?.mimetype,
      size: fileData?.size,
      ownerFolderName: ownerName,
    };

    const data = this.repoService.create(dataToCreate);
    const saved = await this.repoService.save(data);
    return saved;
  }

  async findAll(
    companyId: string,
    pagination: DocsFilterDto,
    state?: boolean,
    search?: string,
  ) {
    const { skip, take } = paginate(pagination);
    const qb = this.repoService
      .createQueryBuilder("d")
      .leftJoinAndSelect("d.folder", "folder")
      .leftJoinAndSelect("d.category", "category")
      .leftJoinAndSelect("d.type", "type")
      .where("d.companyId = :companyId", { companyId });

    if (state !== undefined) qb.andWhere("d.isActive = :state", { state });
    if (search) qb.andWhere("d.title ILIKE :search", { search: `%${search}%` });

    const folderId = (pagination as { folderId?: string }).folderId;
    if (folderId) {
      qb.andWhere("d.folderId = :fid", { fid: folderId });
    }

    qb.orderBy("d.createdAt", "DESC").skip(skip).take(take);
    const [data, total] = await qb.getManyAndCount();
    return paginatedResponse(data, total, pagination as PaginationDto);
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

  async remove(id: string, companyId: string, user?: CurrentUserPayload) {
    const doc = await this.repoService.findOne({
      where: { id, companyId },
      relations: ["folder"],
    });
    if (!doc) throw new NotFoundException(`doc ${id} not found`);

    if (user && doc.folder?.ownerFolderName) {
      const effectiveUserId = user.id || user.sub;
      if (
        doc.createdBy &&
        effectiveUserId &&
        doc.createdBy !== effectiveUserId
      ) {
        throw new ForbiddenException(
          "No puedes eliminar documentos de otro compañero",
        );
      }
    }

    if (doc.storageKey) this.uploadsService.deleteFile(doc.storageKey);
    await this.repoService.remove(doc);
    return { deleted: true, id };
  }
}
