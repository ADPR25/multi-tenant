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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("documents/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions("documents:categories:create")
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.categoriesService.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("documents:categories:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.categoriesService.findAll(companyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("documents:categories:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("documents:categories:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.categoriesService.update(id, dto, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("documents:categories:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.categoriesService.toggleActive(id, companyId);
  }
}
