import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repoService: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto, companyId: string) {
    const data = this.repoService.create({
      ...createProductDto,
      companyId,
    });
    return this.repoService.save(data);
  }

  async findAll(companyId: string, pagination: PaginationDto) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  findOne(id: string, companyId: string) {
    return this.repoService.findOne({ where: { id, companyId } });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    companyId: string,
  ) {
    const product = await this.findOne(id, companyId);
    if (!product) {
      throw new NotFoundException(`product ${id} not found`);
    }
    Object.assign(product, updateProductDto);
    return await this.repoService.save(product);
  }

  async toggleActive(id: string, companyId: string) {
    const product = await this.findOne(id, companyId);
    if (!product) {
      throw new NotFoundException(`product ${id} not found`);
    }
    product.isActive = !product.isActive;
    return await this.repoService.save(product);
  }
}
