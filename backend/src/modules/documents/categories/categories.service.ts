import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
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

  async create(createCategoryDto: CreateCategoryDto, companyId: string) {
    const exists = await this.repoService.findOne({
      where: { companyId, name: createCategoryDto.name },
    });
    if (exists)
      throw new ConflictException(
        `Categoria ${createCategoryDto.name} ya existe`,
      );
    const data = this.repoService.create({ ...createCategoryDto, companyId });
    return this.repoService.save(data);
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repoService.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const one = await this.repoService.findOne({ where: { id, companyId } });
    if (!one) throw new NotFoundException(`category ${id} not found`);
    return one;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    companyId: string,
  ) {
    const category = await this.findOne(id, companyId);
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const exists = await this.repoService.findOne({
        where: { companyId, name: updateCategoryDto.name },
      });
      if (exists)
        throw new ConflictException(
          `Categoria ${updateCategoryDto.name} ya existe`,
        );
    }
    Object.assign(category, updateCategoryDto);
    return await this.repoService.save(category);
  }

  async toggleActive(id: string, companyId: string) {
    const category = await this.findOne(id, companyId);
    category.isActive = !category.isActive;
    return this.repoService.save(category);
  }
}
