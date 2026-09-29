import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Stock } from "./entities/stock.entity";
import { Product } from "../products/entities/product.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { CreateStockDto } from "./dto/create-stock.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock) private readonly repo: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateStockDto, companyId: string) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, companyId },
    });
    if (!product)
      throw new NotFoundException(`Producto ${dto.productId} no existe`);
    const warehouse = await this.warehouseRepo.findOne({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse)
      throw new NotFoundException(`Bodega ${dto.warehouseId} no existe`);

    const exists = await this.repo.findOne({
      where: {
        companyId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
      },
    });
    if (exists)
      throw new ConflictException(
        `Stock ya existe para ese producto en esa bodega`,
      );
    const data = this.repo.create({ ...dto, companyId });
    return await this.repo.save(data);
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    productId?: string,
    warehouseId?: string,
  ) {
    const where: any = { companyId };
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ["product", "warehouse"],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
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

  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
    companyId: string,
  ) {
    const one = await this.repo.findOne({
      where: { productId, warehouseId, companyId },
    });
    if (!one)
      throw new NotFoundException(
        `Stock no encontrado para producto ${productId} en bodega ${warehouseId}`,
      );
    return one;
  }

  async findLowStock(companyId: string, pagination: PaginationDto) {
    const { skip, take } = paginate(pagination);
    const qb = this.repo
      .createQueryBuilder("s")
      .innerJoinAndSelect("s.product", "p")
      .innerJoinAndSelect("s.warehouse", "w")
      .where("s.companyId = :companyId", { companyId })
      .andWhere("s.quantity <= p.min_stock");
    const [data, total] = await qb
      .orderBy("s.quantity", "ASC")
      .take(take)
      .skip(skip)
      .getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }
}
