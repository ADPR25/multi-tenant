import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Brand } from "./entities/brand.entity";
import { ILike, Repository } from "typeorm";
import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  paginate,
  paginatedResponse,
} from "@/common/helpers/pagination.helper";

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly repoService: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto, companyId: string) {
    const exists = await this.repoService.findOne({
      where: { companyId, name: createBrandDto.name },
    });
    if (exists)
      throw new ConflictException(`Marca ${createBrandDto.name} ya existe`);
    const data = this.repoService.create({
      ...createBrandDto,
      companyId,
    });
    return await this.repoService.save(data);
  }

  async findOne(id: string, companyId: string) {
    const brand = await this.repoService.findOne({ where: { id, companyId } });
    if (!brand) throw new NotFoundException(`Marca con id ${id} no encontrada`);
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto, companyId: string) {
    const brand = await this.findOne(id, companyId);
    if (dto.name && dto.name !== brand.name) {
      const exists = await this.repoService.findOne({
        where: { companyId, name: dto.name },
      });
      if (exists) throw new ConflictException(`Marca ${dto.name} ya existe`);
    }
    Object.assign(brand, dto);
    return await this.repoService.save(brand);
  }

  async toggleActive(id: string, companyId: string) {
    const brand = await this.findOne(id, companyId);
    brand.isActive = !brand.isActive;
    return await this.repoService.save(brand);
  }

  async findAll(
    companyId: string,
    pagination: PaginationDto,
    state?: boolean,
    search?: string,
  ) {
    if (!search) {
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

    const [data, total] = await this.repoService.findAndCount({
      where: [
        {
          companyId,
          ...(state !== undefined ? { isActive: state } : {}),
          name: ILike(`%${search}%`),
        },
        {
          companyId,
          ...(state !== undefined ? { isActive: state } : {}),
          description: ILike(`%${search}%`),
        },
      ],
      order: { createdAt: "DESC" },
      ...paginate(pagination),
    });
    return paginatedResponse(data, total, pagination);
  }
}
