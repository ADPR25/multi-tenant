import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingDto } from './dto/create-company-setting.dto';
import { UpdateCompanySettingDto } from './dto/update-company-setting.dto';
import { CurrentCompanyId } from '@/common/decorators/current-company.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Post()
  @RequirePermissions('tenant:company-settings:create')
  create(@Body() dto: CreateCompanySettingDto, @CurrentCompanyId() companyId: string) {
    return this.companySettingsService.create({...dto, companyId });
  }

  @Get()
  @RequirePermissions('tenant:company-settings:read')
  findAll(@CurrentCompanyId() companyId: string) {
    return this.companySettingsService.findAll(companyId);
  }

  @Get(':id')
  @RequirePermissions('tenant:company-settings:read')
  findOne(@Param('id') id: string, @CurrentCompanyId() companyId: string) {
    return this.companySettingsService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('tenant:company-settings:update')
  update(@Param('id') id: string, @CurrentCompanyId() companyId: string, @Body() dto: UpdateCompanySettingDto) {
    return this.companySettingsService.update(id, companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('tenant:company-settings:delete')
  remove(@Param('id') id: string, @CurrentCompanyId() companyId: string) {
    return this.companySettingsService.remove(id, companyId);
  }
}