import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateDocDto } from "./dto/create-doc.dto";
import { UpdateDocDto } from "./dto/update-doc.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Doc } from "./entities/doc.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Doc) private readonly repoService: Repository<Doc>,
  ) {}

  create(createDocDto: CreateDocDto, companyId: string) {
    const data = this.repoService.create({
      ...createDocDto,
      companyId,
    });
    return this.repoService.save(data);
  }

  async findAll(companyId: string, pagination: PaginationDto, state: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const doc = await this.repoService.findOne({
      where: { id, companyId },
    });
    if (!doc) throw new NotFoundException(`doc ${id} not found`);
    return doc;
  }

  async update(id: string, updateDocDto: UpdateDocDto, companyId: string) {
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
