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
import { UomService } from "./uom.service";
import { CreateUomDto } from "./dto/create-uom.dto";
import { UpdateUomDto } from "./dto/update-uom.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { FilterDto } from "@/common/filters/filter.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("uom")
export class UomController {
  constructor(private readonly uomService: UomService) {}

  @Post()
  @RequirePermissions("inventory:uom:create")
  create(
    @Body() createUomDto: CreateUomDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.uomService.create(createUomDto, companyId);
  }

  @Get()
  @RequirePermissions("inventory:uom:read")
  findAll(@CurrentCompanyId() companyId: string, @Query() filter: FilterDto) {
    const isActive =
      filter.state !== undefined ? filter.state === "true" : undefined;
    return this.uomService.findAll(companyId, filter, isActive, filter.find);
  }

  @Get(":id")
  @RequirePermissions("inventory:uom:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.uomService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("inventory:uom:update")
  update(
    @Param("id") id: string,
    @Body() updateUomDto: UpdateUomDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.uomService.update(id, updateUomDto, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("inventory:uom:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.uomService.toggleActive(id, companyId);
  }
}
