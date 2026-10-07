import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Stock } from "./entities/stock.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock) private readonly repo: Repository<Stock>,
  ) { }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    productId?: string,
    warehouseId?: string,
    search?: string,
    status?: "low" | "out" | "ok" | "all",
  ) {
    const { skip, take } = paginate(pagination);

    const qb = this.repo
      .createQueryBuilder("s")
      .innerJoinAndSelect("s.product", "p")
      .innerJoinAndSelect("s.warehouse", "w")
      .where("s.companyId = :companyId", { companyId });

    if (productId) qb.andWhere("s.productId = :productId", { productId });
    if (warehouseId) qb.andWhere("s.warehouseId = :warehouseId", { warehouseId });

    if (search) {
      qb.andWhere(
        "(p.name ILIKE :search OR p.sku ILIKE :search OR w.name ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (status === "out") {
      qb.andWhere("s.quantity <= 0");
    } else if (status === "low") {
      qb.andWhere("s.quantity > 0 AND s.quantity <= p.min_stock");
    } else if (status === "ok") {
      qb.andWhere("s.quantity > p.min_stock");
    }

    qb.orderBy("s.updatedAt", "DESC");

    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.repo.findOne({
      where: { id, companyId },
      relations: ["product", "warehouse"],
    });
    if (!one) throw new NotFoundException(`Stock ${id} not found`);
    return one;
  }

  async findLowStock(companyId: string, pagination: PaginationDto) {
    const { skip, take } = paginate(pagination);
    const qb = this.repo
      .createQueryBuilder("s")
      .innerJoinAndSelect("s.product", "p")
      .innerJoinAndSelect("s.warehouse", "w")
      .where("s.companyId = :companyId", { companyId })
      .andWhere("s.quantity > 0")
      .andWhere("s.quantity <= p.min_stock")
      .orderBy("s.quantity", "ASC");

    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }
}