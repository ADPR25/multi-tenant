import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySetting } from './entities/company-setting.entity';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';

@Injectable()
export class CompanySettingsService {
  constructor(@InjectRepository(CompanySetting) private readonly repo: Repository<CompanySetting>) {}

  async create(dto: CreateCompanySettingDto & { companyId: string }) {
    const exists = await this.repo.findOne({ where: { companyId: dto.companyId } });
    if (exists) throw new ConflictException('Esta empresa ya tiene configuración');
    const setting = this.repo.create(dto);
    return this.repo.save(setting);
  }

  findAll(companyId: string) {
    return this.repo.find({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    const setting = await this.repo.findOne({ where: { id, companyId } });
    if (!setting) throw new NotFoundException('Setting no encontrado');
    return setting;
  }

  async update(id: string, companyId: string, dto: UpdateCompanySettingDto) {
    const setting = await this.findOne(id, companyId);
    Object.assign(setting, dto);
    return this.repo.save(setting);
  }

  async remove(id: string, companyId: string) {
    const setting = await this.findOne(id, companyId);
    return this.repo.softRemove(setting);
  }
}