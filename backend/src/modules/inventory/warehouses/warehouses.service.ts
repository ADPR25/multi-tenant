import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Warehouse } from "./entities/warehouse.entity";
import { Product } from "../products/entities/product.entity";
import { Stock } from "../stocks/entities/stock.entity";
import { Repository, DataSource } from "typeorm";
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
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateWarehouseDto, companyId: string) {
    const exists = await this.repoService.findOne({
      where: { companyId, code: dto.code },
    });
    if (exists) throw new ConflictException(`Bodega con codigo ${dto.code} ya existe`);

    const data = this.repoService.create({ ...dto, companyId });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedWh = await queryRunner.manager.save(data);
      const products = await queryRunner.manager.find(Product, {
        where: { companyId, isActive: true },
      });

      if (products.length > 0) {
        const stocksToInsert = products.map((p) => ({
          companyId,
          productId: p.id,
          warehouseId: savedWh.id,
          quantity: 0,
        }));

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Stock)
          .values(stocksToInsert)
          .orIgnore()
          .execute();
      }

      await queryRunner.commitTransaction();
      return savedWh;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    state?: boolean,
    find?: string,
  ) {
    const isSelect = find === "select" || find?.includes("select");
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      ...(isSelect ? { select: ["id", "name"] as const } : {}),
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.repoService.findOne({ where: { id, companyId } });
    if (!one) throw new NotFoundException(`warehouses ${id} not found`);
    return one;
  }

  async update(id: string, dto: UpdateWarehouseDto, companyId: string) {
    const warehouse = await this.findOne(id, companyId);
    if (dto.code && dto.code !== warehouse.code) {
      const exists = await this.repoService.findOne({
        where: { companyId, code: dto.code },
      });
      if (exists) throw new ConflictException(`Codigo ${dto.code} ya existe`);
    }
    Object.assign(warehouse, dto);
    return this.repoService.save(warehouse);
  }

  async toggleActive(id: string, companyId: string) {
    const warehouse = await this.findOne(id, companyId);
    warehouse.isActive = !warehouse.isActive;
    return this.repoService.save(warehouse);
  }
}