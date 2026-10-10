import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateTypeDto } from "./dto/create-type.dto";
import { UpdateTypeDto } from "./dto/update-type.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Type } from "./entities/type.entity";
import { Repository } from "typeorm";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type) private readonly repo: Repository<Type>,
  ) {}

  async create(createTypeDto: CreateTypeDto, companyId: string) {
    const exists = await this.repo.findOne({
      where: { companyId, name: createTypeDto.name },
    });
    if (exists)
      throw new ConflictException(
        `Type with name ${createTypeDto.name} already exists`,
      );

    const entity = this.repo.create({ ...createTypeDto, companyId });
    return this.repo.save(entity);
  }

  async findAll(companyId: string, pagination: PaginationDto, state?: boolean) {
    const [data, total] = await this.repo.findAndCount({
      where: { companyId, ...(state !== undefined ? { isActive: state } : {}) },
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }

  async findOne(id: string, companyId: string) {
    const entity = await this.repo.findOne({ where: { id, companyId } });
    if (!entity) throw new NotFoundException(`Type ${id} not found`);
    return entity;
  }

  async update(id: string, updateTypeDto: UpdateTypeDto, companyId: string) {
    const entity = await this.findOne(id, companyId);
    if (updateTypeDto.name && updateTypeDto.name !== entity.name) {
      const exists = await this.repo.findOne({
        where: { companyId, name: updateTypeDto.name },
      });
      if (exists)
        throw new ConflictException(
          `Type with name ${updateTypeDto.name} already exists`,
        );
    }
    Object.assign(entity, updateTypeDto);
    return this.repo.save(entity);
  }

  async toggleActive(id: string, companyId: string) {
    const entity = await this.findOne(id, companyId);
    entity.isActive = !entity.isActive;
    return this.repo.save(entity);
  }
}