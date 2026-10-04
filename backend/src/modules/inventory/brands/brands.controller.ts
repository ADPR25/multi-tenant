import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { FilterDto } from "@/common/filters/filter.dto";

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
  findAll(@CurrentCompanyId() companyId: string, @Query() filter: FilterDto) {
    const isActive =
      filter.state !== undefined ? filter.state === "true" : undefined;
    return this.brandsService.findAll(
      companyId,
      filter,
      isActive,
      filter.search?.trim(),
      filter.find,
    );
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:brands:state")
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
