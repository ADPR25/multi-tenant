import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Warehouse } from "./entities/warehouse.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repoService: Repository<Warehouse>,
  ) {}

  create(createWarehouseDto: CreateWarehouseDto, companyId: string) {
    const data = this.repoService.create({
      ...createWarehouseDto,
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

  findOne(id: string, companyId: string) {
    return this.repoService.findOne({
      where: {
        id,
        companyId,
      },
    });
  }

  async update(
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
    companyId: string,
  ) {
    const warehouse = await this.findOne(id, companyId);
    Object.assign(warehouse, updateWarehouseDto);
    return this.repoService.save(warehouse);
  }

  async toggleActive(id: string, companyId: string) {
    const warehouse = await this.findOne(id, companyId);
    warehouse.isActive = !warehouse.isActive;
    return this.repoService.save(warehouse);
  }
}
