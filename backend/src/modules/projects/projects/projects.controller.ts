import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import {
  PaginationDto,
  PaginatedResponseDto,
} from "@/common/dto/pagination.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Project } from "./entities/project.entity";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  @RequirePermissions("projects:create")
  create(
    @Body() dto: CreateProjectDto,
    @CurrentCompanyId() companyId: string,
  ): Promise<Project> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("projects:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("search") search?: string,
  ): Promise<PaginatedResponseDto<Project>> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.findAll(companyId, pagination, search);
  }

  @Patch("active/:id")
  @RequirePermissions("projects:state")
  toggle(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<Project> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.toggleActive(id, companyId);
  }

  @Get(":id")
  @RequirePermissions("projects:read")
  findOne(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<Project> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("projects:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentCompanyId() companyId: string,
  ): Promise<Project> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.update(id, dto, companyId);
  }

  @Delete(":id")
  @RequirePermissions("projects:delete")
  remove(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ): Promise<{ message: string }> {
    if (!companyId) throw new Error("companyId requerido");
    return this.service.remove(id, companyId);
  }
}