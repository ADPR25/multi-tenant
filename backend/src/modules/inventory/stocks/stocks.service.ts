import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Stock } from "./entities/stock.entity";
import { Product } from "../products/entities/product.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { CreateStockDto } from "./dto/create-stock.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { paginate, paginatedResponse } from "@/common/helpers/pagination.helper";

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock) private readonly repo: Repository<Stock>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateStockDto, companyId: string) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId, companyId } });
    if (!product) throw new NotFoundException(`Producto ${dto.productId} no existe`);
    const warehouse = await this.warehouseRepo.findOne({ where: { id: dto.warehouseId, companyId } });
    if (!warehouse) throw new NotFoundException(`Bodega ${dto.warehouseId} no existe`);
    const exists = await this.repo.findOne({ where: { companyId, productId: dto.productId, warehouseId: dto.warehouseId } });
    if (exists) throw new ConflictException(`Stock ya existe para ese producto en esa bodega`);
    return await this.repo.save(this.repo.create({ ...dto, companyId }));
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    productId?: string,
    warehouseId?: string,
    search?: string,
    status?: 'low' | 'out' | 'ok' | 'all'
  ) {
    const { skip, take } = paginate(pagination);
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;

    const qb = this.repo.createQueryBuilder("s")
      .innerJoinAndSelect("s.product", "p")
      .innerJoinAndSelect("s.warehouse", "w")
      .where("s.companyId = :companyId", { companyId })
      // ESTO EVITA EL DUPLICADO QUE VES: solo la fila más nueva por producto+bodega
      .distinctOn(["s.productId", "s.warehouseId"])
      .orderBy("s.productId", "ASC")
      .addOrderBy("s.warehouseId", "ASC")
      .addOrderBy("s.updatedAt", "DESC");

    if (productId) qb.andWhere("s.productId = :productId", { productId });
    if (warehouseId) qb.andWhere("s.warehouseId = :warehouseId", { warehouseId });

    if (search) {
      qb.andWhere("(p.name ILIKE :search OR p.sku ILIKE :search OR w.name ILIKE :search)", { search: `%${search}%` });
    }

    // Por defecto NO mostramos ceros, solo si pides status=all o out
    if (status === 'out') {
      qb.andWhere("s.quantity <= 0");
    } else if (status === 'low') {
      qb.andWhere("s.quantity > 0 AND s.quantity <= p.min_stock");
    } else if (status !== 'all') {
      // ok = solo stock actual > 0 (como tu captura de 25 y 83)
      qb.andWhere("s.quantity > 0");
    }

    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
    return paginatedResponse(data, total, { page, limit } as PaginationDto);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.repo.findOne({ where: { id, companyId }, relations: ["product", "warehouse"] });
    if (!one) throw new NotFoundException(`Stock ${id} not found`);
    return one;
  }

  async findLowStock(companyId: string, pagination: PaginationDto) {
    const { skip, take } = paginate(pagination);
    const qb = this.repo.createQueryBuilder("s")
      .innerJoinAndSelect("s.product", "p")
      .innerJoinAndSelect("s.warehouse", "w")
      .where("s.companyId = :companyId", { companyId })
      .andWhere("s.quantity > 0")
      .andWhere("s.quantity <= p.min_stock");
    const [data, total] = await qb.orderBy("s.quantity", "ASC").skip(skip).take(take).getManyAndCount();
    return paginatedResponse(data, total, pagination);
  }
}