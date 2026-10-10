import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Brand } from "../brands/entities/brand.entity";
import { Category } from "../categories/entities/category.entity";
import { Uom } from "../uom/entities/uom.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { Stock } from "../stocks/entities/stock.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

type ProductWithStock = Product & {
  warehouseId: string | null;
  warehouse: Warehouse | null;
  warehouses: Warehouse[];
  stocks: Stock[];
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Uom) private readonly uomRepo: Repository<Uom>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  private getStockRepo(): Repository<Stock> {
    return this.dataSource.getRepository(Stock);
  }

  async create(
    createProductDto: CreateProductDto,
    companyId: string,
  ): Promise<Product> {
    const skuExists = await this.repo.findOne({
      where: { companyId, sku: createProductDto.sku },
    });
    if (skuExists) {
      throw new ConflictException(`SKU ${createProductDto.sku} already exists`);
    }

    if (createProductDto.brandId) {
      const brand = await this.brandRepo.findOne({
        where: { id: createProductDto.brandId, companyId },
      });
      if (!brand) {
        throw new NotFoundException(
          `Brand ${createProductDto.brandId} does not exist`,
        );
      }
    }

    if (createProductDto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: createProductDto.categoryId, companyId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category ${createProductDto.categoryId} does not exist`,
        );
      }
    }

    const uom = await this.uomRepo.findOne({
      where: { id: createProductDto.uomId, companyId },
    });
    if (!uom) {
      throw new NotFoundException(
        `UoM ${createProductDto.uomId} does not exist`,
      );
    }

    const effectiveWarehouseId = createProductDto.warehouseId ?? null;

    let targetWarehouses: Warehouse[] = [];
    if (effectiveWarehouseId) {
      const wh = await this.warehouseRepo.findOne({
        where: {
          id: effectiveWarehouseId,
          companyId,
          isActive: true,
        },
      });
      if (!wh) {
        throw new NotFoundException(
          `Warehouse ${effectiveWarehouseId} does not exist`,
        );
      }
      targetWarehouses = [wh];
    } else {
      targetWarehouses = await this.warehouseRepo.find({
        where: { companyId, isActive: true },
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { warehouseId: _warehouseId, ...productData } = createProductDto;

      const product = queryRunner.manager.create(Product, {
        ...productData,
        companyId,
      });
      const savedProduct = await queryRunner.manager.save(product);

      if (targetWarehouses.length > 0) {
        const stocksToInsert = targetWarehouses.map((wh) => ({
          companyId,
          productId: savedProduct.id,
          warehouseId: wh.id,
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
      return savedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) throw error;
      throw new Error("Unknown error while creating product");
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repo.findAndCount({
      where: {
        companyId,
        ...(state !== undefined ? { isActive: state } : {}),
      },
      relations: { brand: true, category: true, uom: true },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });

    if (data.length === 0) {
      return paginatedResponse(data, total, pagination);
    }

    const productIds = data.map((p) => p.id);
    const stockRepo = this.getStockRepo();

    const stocks = await stockRepo.find({
      where: { companyId, productId: In(productIds) },
      relations: { warehouse: true },
    });

    const stocksByProduct = new Map<string, Stock[]>();
    for (const s of stocks) {
      const list = stocksByProduct.get(s.productId) ?? [];
      list.push(s);
      stocksByProduct.set(s.productId, list);
    }

    const dataWithWarehouse: ProductWithStock[] = data.map((product) => {
      const productStocks = stocksByProduct.get(product.id) ?? [];
      const primaryStock = productStocks[0] ?? null;

      return {
        ...product,
        warehouseId: primaryStock?.warehouseId ?? null,
        warehouse: primaryStock?.warehouse ?? null,
        warehouses: productStocks
          .map((s) => s.warehouse)
          .filter((w): w is Warehouse => w !== null && w !== undefined),
        stocks: productStocks,
      };
    });

    return paginatedResponse(dataWithWarehouse, total, pagination);
  }

  async findOne(id: string, companyId: string): Promise<ProductWithStock> {
    const product = await this.repo.findOne({
      where: { id, companyId },
      relations: { brand: true, category: true, uom: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const stockRepo = this.getStockRepo();
    const stocks = await stockRepo.find({
      where: { companyId, productId: id },
      relations: { warehouse: true },
    });

    const primaryStock = stocks[0] ?? null;

    return {
      ...product,
      warehouseId: primaryStock?.warehouseId ?? null,
      warehouse: primaryStock?.warehouse ?? null,
      warehouses: stocks
        .map((s) => s.warehouse)
        .filter((w): w is Warehouse => w !== null && w !== undefined),
      stocks,
    };
  }

  private async findEntity(id: string, companyId: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id, companyId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    companyId: string,
  ): Promise<Product> {
    const product = await this.findEntity(id, companyId);

    if (dto.sku && dto.sku !== product.sku) {
      const skuExists = await this.repo.findOne({
        where: { companyId, sku: dto.sku },
      });
      if (skuExists) {
        throw new ConflictException(`SKU ${dto.sku} already exists`);
      }
    }

    const effectiveWarehouseId = dto.warehouseId ?? null;

    if (effectiveWarehouseId) {
      const newWh = await this.warehouseRepo.findOne({
        where: { id: effectiveWarehouseId, companyId, isActive: true },
      });
      if (!newWh) {
        throw new NotFoundException(
          `Warehouse ${effectiveWarehouseId} does not exist`,
        );
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const { warehouseId: _warehouseId, ...productData } = dto;

        Object.assign(product, productData);
        await queryRunner.manager.save(product);

        let destStock = await queryRunner.manager.findOne(Stock, {
          where: {
            companyId,
            productId: id,
            warehouseId: effectiveWarehouseId,
          },
          lock: { mode: "pessimistic_write" },
        });

        if (!destStock) {
          destStock = queryRunner.manager.create(Stock, {
            companyId,
            productId: id,
            warehouseId: effectiveWarehouseId,
            quantity: 0,
          });
          destStock = await queryRunner.manager.save(destStock);
        }

        const otherStocks = await queryRunner.manager.find(Stock, {
          where: { companyId, productId: id },
        });

        for (const s of otherStocks) {
          if (s.warehouseId === effectiveWarehouseId) continue;
          const qty = Number(s.quantity);
          if (qty <= 0) continue;

          s.quantity = 0;
          await queryRunner.manager.save(s);
          destStock.quantity = Number(destStock.quantity) + qty;
        }

        await queryRunner.manager.save(destStock);
        await queryRunner.commitTransaction();
        return product;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error) throw error;
        throw new Error("Unknown error while updating product");
      } finally {
        await queryRunner.release();
      }
    }

    const { warehouseId: _warehouseId, ...rest } = dto;
    Object.assign(product, rest);
    return await this.repo.save(product);
  }

  async toggleActive(id: string, companyId: string): Promise<Product> {
    const product = await this.findEntity(id, companyId);
    product.isActive = !product.isActive;
    return await this.repo.save(product);
  }
}
