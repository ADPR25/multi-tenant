import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CreateUomDto } from "./dto/create-uom.dto";
import { UpdateUomDto } from "./dto/update-uom.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Uom } from "./entities/uom.entity";
import { Repository } from "typeorm";
import { paginate, paginatedResponse } from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class UomService {
  constructor(@InjectRepository(Uom) private readonly repoService: Repository<Uom>) {}

  async create(dto: CreateUomDto, companyId: string) {
    const exists = await this.repoService.findOne({ where: { companyId, name: dto.name } });
    if (exists) throw new ConflictException(`UoM ${dto.name} ya existe`);
    const create = this.repoService.create({...dto, companyId });
    return this.repoService.save(create);
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId,...(state!== undefined? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
     ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.repoService.findOne({ where: { id, companyId } });
    if (!one) throw new NotFoundException(`uom ${id} not found`);
    return one;
  }

  async update(id: string, dto: UpdateUomDto, companyId: string) {
    const uom = await this.findOne(id, companyId);
    Object.assign(uom, dto);
    return await this.repoService.save(uom);
  }

  async toggleActive(id: string, companyId: string) {
    const uom = await this.findOne(id, companyId);
    uom.isActive =!uom.isActive;
    return this.repoService.save(uom);
  }
}