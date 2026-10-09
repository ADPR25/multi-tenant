import { Controller, Post, Body, Param, Get, Delete, UseGuards } from "@nestjs/common";
import { AddendumsService } from "./addendums.service";
import { CreateAddendumDto } from "./dto/create-addendum.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("addendums")
export class AddendumsController {
  constructor(private readonly service: AddendumsService) { }

  @Post() @RequirePermissions("hiring:contract:update") create(
    @Body() dto: CreateAddendumDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.create(dto, companyId);
  }

  @Get("contract/:contractId")
  @RequirePermissions("hiring:contract:read")
  findByContract(
    @Param("contractId") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.findByContract(id, companyId);
  }
  
  @Delete(":id") @RequirePermissions("hiring:contract:update") remove(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.remove(id, companyId);
  }
}
