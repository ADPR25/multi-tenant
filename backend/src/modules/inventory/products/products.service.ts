import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
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
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, companyId: string) {
    const skuExists = await this.repo.findOne({
      where: { companyId, sku: createProductDto.sku },
    });
    if (skuExists)
      throw new ConflictException(`SKU ${createProductDto.sku} ya existe`);

    if (createProductDto.brandId) {
      const brand = await this.brandRepo.findOne({
        where: { id: createProductDto.brandId, companyId },
      });
      if (!brand)
        throw new NotFoundException(
          `Brand ${createProductDto.brandId} no existe en tu empresa`,
        );
    }
    if (createProductDto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: createProductDto.categoryId, companyId },
      });
      if (!category)
        throw new NotFoundException(
          `Category ${createProductDto.categoryId} no existe en tu empresa`,
        );
    }
    const uom = await this.uomRepo.findOne({
      where: { id: createProductDto.uomId, companyId },
    });
    if (!uom)
      throw new NotFoundException(
        `UoM ${createProductDto.uomId} no existe en tu empresa`,
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = queryRunner.manager.create(Product, {
        ...createProductDto,
        companyId,
      });
      const savedProduct = await queryRunner.manager.save(product);

      const warehouses = await queryRunner.manager.find(Warehouse, {
        where: { companyId, isActive: true },
      });
      if (warehouses.length > 0) {
        const stocks = warehouses.map((wh) =>
          queryRunner.manager.create(Stock, {
            companyId,
            productId: savedProduct.id,
            warehouseId: wh.id,
            quantity: 0,
          }),
        );
        await queryRunner.manager.save(stocks);
      }

      await queryRunner.commitTransaction();
      return savedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      relations: ["brand", "category", "uom"],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const product = await this.repo.findOne({
      where: { id, companyId },
      relations: ["brand", "category", "uom"],
    });
    if (!product)
      throw new NotFoundException(`Product con id ${id} no encontrado`);
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    companyId: string,
  ) {
    const product = await this.findOne(id, companyId);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const skuExists = await this.repo.findOne({
        where: { companyId, sku: updateProductDto.sku },
      });
      if (skuExists)
        throw new ConflictException(`SKU ${updateProductDto.sku} ya existe`);
    }

    if (updateProductDto.brandId) {
      const brand = await this.brandRepo.findOne({
        where: { id: updateProductDto.brandId, companyId },
      });
      if (!brand)
        throw new NotFoundException(
          `Brand ${updateProductDto.brandId} no existe`,
        );
    }
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: updateProductDto.categoryId, companyId },
      });
      if (!category)
        throw new NotFoundException(
          `Category ${updateProductDto.categoryId} no existe`,
        );
    }
    if (updateProductDto.uomId) {
      const uom = await this.uomRepo.findOne({
        where: { id: updateProductDto.uomId, companyId },
      });
      if (!uom)
        throw new NotFoundException(`UoM ${updateProductDto.uomId} no existe`);
    }

    Object.assign(product, updateProductDto);
    return await this.repo.save(product);
  }

  async toggleActive(id: string, companyId: string) {
    const product = await this.findOne(id, companyId);
    product.isActive = !product.isActive;
    return await this.repo.save(product);
  }
}
