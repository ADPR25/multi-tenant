import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repoService: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto, companyId: string) {
    const data = this.repoService.create({
      ...createCategoryDto,
      companyId,
    });
    const save = this.repoService.save(data);
    return save;
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: {
        companyId,
        ...(state !== undefined ? { isActive: state } : {}),
      },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  findOne(id: string, companyId: string) {
    const one = this.repoService.findOne({
      where: { id, companyId },
    });
    if (!one) throw new NotFoundException(`category ${id} not found`);
    return one;
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
    return this.repoService.save(category);
  }
}
