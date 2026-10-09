import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { RequirementsService } from "./requirements.service";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("requirements")
export class RequirementsController {
  constructor(private readonly service: RequirementsService) {}
  @Post() @RequirePermissions("hiring:contract:update") create(
    @Body() dto: CreateRequirementDto,
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

  @Patch(":id/toggle") @RequirePermissions("hiring:contract:update") toggle(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.toggleDelivered(id, companyId);
  }

  @Delete(":id") @RequirePermissions("hiring:contract:update") remove(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.remove(id, companyId);
  }
}
