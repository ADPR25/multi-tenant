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
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions("inventory:product:create")
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.productsService.create(createProductDto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:product:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.productsService.findAll(companyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("inventory:product:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.productsService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:product:update")
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.productsService.update(id, updateProductDto, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:product:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.productsService.toggleActive(id, companyId);
  }
}
