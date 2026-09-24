import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Brand } from "./entities/brand.entity";
import { Repository } from "typeorm";

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly repoService: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto, companyId: string) {
    const data = this.repoService.create({
      name: createBrandDto.name,
      companyId,
    });
    return await this.repoService.save(data);
  }

  async findAll(companyId: string) {
    return await this.repoService.find({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string) {
    const brand = await this.repoService.findOne({ where: { id, companyId } });
    if (!brand) throw new NotFoundException(`Marca con id ${id} no encontrada`);
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, companyId: string) {
    const brand = await this.findOne(id, companyId);
    Object.assign(brand, updateBrandDto);
    return await this.repoService.save(brand);
  }

  async toggleActive(id: string, companyId: string) {
    const brand = await this.findOne(id, companyId);
    brand.isActive = !brand.isActive;
    return await this.repoService.save(brand);
  }
}
