import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { StockMovementsService } from "./stock-movements.service";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("stock-movements")
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  @Post()
  @RequirePermissions("inventory:movements:create")
  create(
    @Body() dto: CreateStockMovementDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:movements:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("productId") productId?: string,
    @Query("warehouseId") warehouseId?: string,
  ) {
    return this.service.findAll(companyId, pagination, productId, warehouseId);
  }

  @Get(":id")
  @RequirePermissions("inventory:movements:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.findOne(id, companyId);
  }
}
