import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

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
  @RequirePermissions("inventory:categories:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.categoriesService.findAll(companyId, pagination, isActive);
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:categories:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.toggleActive(id, companyId);
  }

  @Get(":id")
  @RequirePermissions("inventory:categories:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:categories:update")
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, companyId);
  }
}
