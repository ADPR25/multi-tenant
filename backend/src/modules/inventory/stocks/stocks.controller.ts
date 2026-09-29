import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { StocksService } from "./stocks.service";
import { CreateStockDto } from "./dto/create-stock.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("stocks")
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @RequirePermissions("inventory:stocks:create")
  create(@Body() dto: CreateStockDto, @CurrentCompanyId() companyId: string) {
    return this.stocksService.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:stocks:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("productId") productId?: string,
    @Query("warehouseId") warehouseId?: string,
  ) {
    return this.stocksService.findAll(
      companyId,
      pagination,
      productId,
      warehouseId,
    );
  }

  @Get(":id")
  @RequirePermissions("inventory:stocks:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.stocksService.findOne(id, companyId);
  }
}
