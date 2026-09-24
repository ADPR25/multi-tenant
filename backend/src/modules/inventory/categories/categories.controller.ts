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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions("inventory:categories:create")
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.categoriesService.create(createCategoryDto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:read")
  findAll(@CurrentCompanyId() companyId: string) {
    return this.categoriesService.findAll(companyId);
  }

  @Patch()
  @RequirePermissions("inventory:active")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.toggleActive(id, companyId);
  }

  @Get(":id")
  @RequirePermissions("inventory:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:update")
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }
}
