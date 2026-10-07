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
import { WarehousesService } from "./warehouses.service";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { FilterDto } from "@/common/filters/filter.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("warehouses")
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) { }

  @Post()
  @RequirePermissions("inventory:warehouse:create")
  create(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.warehousesService.create(createWarehouseDto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:warehouse:read")
  findAll(@CurrentCompanyId() companyId: string, @Query() filter: FilterDto) {
    const isActive =
      filter.state !== undefined ? filter.state === "true" : undefined;
    return this.warehousesService.findAll(companyId, filter, isActive, filter.find);
  }

  @Get(":id")
  @RequirePermissions("inventory:warehouse:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.warehousesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:warehouse:update")
  update(
    @Param("id") id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:warehouse:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.warehousesService.toggleActive(id, companyId);
  }
}
