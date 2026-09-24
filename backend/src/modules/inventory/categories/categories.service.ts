import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repoService: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto, companyId: string) {
    const data = this.repoService.create({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      companyId: companyId,
    });
    const create = this.repoService.save(data);
    return create;
  }

  findAll(companyId: string) {
    const find = this.repoService.find({
      where: { companyId: companyId },
    });
    return find;
  }

  findOne(id: string, companyId: string) {
    const category = this.repoService.findOne({
      where: { id, companyId },
    });
    if (!category) throw new NotFoundException(`categoria con id: ${id} no encontrada`)
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, companyId: string) {
    const category = await this.findOne(id, companyId)
    Object.assign(category, updateCategoryDto)
    return await this.repoService.save(category)
  }

  async toggleActive(id: string, companyId: string) {
    const category = await this.findOne(id, companyId)
    category.isActive = !category.isActive
    return await this.repoService.save(category)
  }
}
