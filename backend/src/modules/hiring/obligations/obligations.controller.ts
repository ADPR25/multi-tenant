import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { ObligationsService } from "./obligations.service";
import { CreateObligationDto } from "./dto/create-obligation.dto";
import { UpdateObligationDto } from "./dto/update-obligation.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("obligations")
export class ObligationsController {
  constructor(private readonly service: ObligationsService) {}

  @Post()
  @RequirePermissions("hiring:obligation:create")
  create(@Body() dto: CreateObligationDto, @CurrentCompanyId() companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get("contract/:contractId")
  @RequirePermissions("hiring:obligation:read")
  findByContract(
    @Param("contractId") contractId: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.findByContract(contractId, companyId);
  }

  @Get(":id")
  @RequirePermissions("hiring:obligation:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("hiring:obligation:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateObligationDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.update(id, dto, companyId);
  }

  @Delete(":id")
  @RequirePermissions("hiring:obligation:delete")
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.remove(id, companyId);
  }

  @Post("reorder/:contractId")
  @RequirePermissions("hiring:obligation:update")
  reorder(
    @Param("contractId") contractId: string,
    @Body("order") orderIds: string[],
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.reorder(contractId, orderIds, companyId);
  }
}
