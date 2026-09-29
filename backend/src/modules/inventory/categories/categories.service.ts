import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repoService: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto, companyId: string) {
    const data = this.repoService.create({
      ...createCategoryDto,
      companyId: companyId,
    });
    const create = this.repoService.save(data);
    return create;
  }

  async findAll(companyId: string, pagination: PaginationDto, state: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: {
        companyId: companyId,
        ...(state !== undefined ? { isActive: state } : {}),
      },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const category = await this.repoService.findOne({
      where: { id, companyId },
    });
    if (!category)
      throw new NotFoundException(`categoria con id: ${id} no encontrada`);
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    companyId: string,
  ) {
    const category = await this.findOne(id, companyId);
    Object.assign(category, updateCategoryDto);
    return await this.repoService.save(category);
  }

  async toggleActive(id: string, companyId: string) {
    const category = await this.findOne(id, companyId);
    category.isActive = !category.isActive;
    return await this.repoService.save(category);
  }
}
