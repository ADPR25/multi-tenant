import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Post()
  @RequirePermissions("projects:create")
  create(
    @Body() dto: CreateActivityDto,
    @CurrentCompanyId() companyId: string,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.create(dto, companyId);
  }

  @Get("project/:projectId")
  @RequirePermissions("projects:read")
  findByProject(
    @Param("projectId") projectId: string,
    @CurrentCompanyId() companyId: string,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.findByProject(projectId, companyId);
  }

  @Get("phase/:phaseId")
  @RequirePermissions("projects:read")
  findByPhase(
    @Param("phaseId") phaseId: string,
    @CurrentCompanyId() companyId: string,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.findByPhase(phaseId, companyId);
  }

  @Get(":id")
  @RequirePermissions("projects:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("projects:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateActivityDto,
    @CurrentCompanyId() companyId: string,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.update(id, dto, companyId);
  }

  @Delete(":id")
  @RequirePermissions("projects:delete")
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.remove(id, companyId);
  }
}
