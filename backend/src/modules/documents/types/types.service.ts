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
    @InjectRepository(Type) private readonly repoService: Repository<Type>,
  ) {}

  async create(createTypeDto: CreateTypeDto, companyId: string) {
    const exists = await this.repoService.findOne({
      where: { companyId, name: createTypeDto.name },
    });
    if (exists)
      throw new ConflictException(
        `Tipo con nombre ${createTypeDto.name} ya existe`,
      );

    const data = this.repoService.create({ ...createTypeDto, companyId });
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
    if (!one) throw new NotFoundException(`type ${id} not found`);
    return one;
  }

  async update(id: string, updateTypeDto: UpdateTypeDto, companyId: string) {
    const type = await this.findOne(id, companyId);
    if (updateTypeDto.name && updateTypeDto.name !== type.name) {
      const exists = await this.repoService.findOne({
        where: { companyId, name: updateTypeDto.name },
      });
      if (exists)
        throw new ConflictException(
          `Tipo con nombre ${updateTypeDto.name} ya existe`,
        );
    }
    Object.assign(type, updateTypeDto);
    return this.repoService.save(type);
  }

  async toggleActive(id: string, companyId: string) {
    const type = await this.findOne(id, companyId);
    type.isActive = !type.isActive;
    return this.repoService.save(type);
  }
}
