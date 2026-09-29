import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUomDto } from "./dto/create-uom.dto";
import { UpdateUomDto } from "./dto/update-uom.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Uom } from "./entities/uom.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class UomService {
  constructor(
    @InjectRepository(Uom) private readonly repoService: Repository<Uom>,
  ) {}
  create(createUomDto: CreateUomDto, companyId: string) {
    const create = this.repoService.create({
      ...createUomDto,
      companyId,
    });
    return this.repoService.save(create);
  }

  async findAll(companyId: string, pagination: PaginationDto, state: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  findOne(id: string, companyId: string) {
    return this.repoService.findOne({
      where: { id, companyId },
    });
  }

  async update(id: string, updateUomDto: UpdateUomDto, companyId: string) {
    const uom = await this.findOne(id, companyId);
    Object.assign(uom, updateUomDto);
    return await this.repoService.save(uom);
  }

  async toggleActive(id: string, companyId: string) {
    const uom = await this.findOne(id, companyId);
    uom.isActive = !uom.isActive;
    return this.repoService.save(uom);
  }
}
