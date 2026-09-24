import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @RequirePermissions("inventory:brands:create")
  create(
    @Body() createBrandDto: CreateBrandDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.brandsService.create(createBrandDto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:brands:read")
  findAll(@CurrentCompanyId() companyId: string) {
    return this.brandsService.findAll(companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:brands:active")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.brandsService.toggleActive(id, companyId);
  }

  @Get(":id")
  @RequirePermissions("inventory:brands:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.brandsService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:brands:update")
  update(
    @Param("id") id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.brandsService.update(id, updateBrandDto, companyId);
  }
}
