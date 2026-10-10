import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { FilterDto } from "@/common/filters/filter.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @RequirePermissions("projects:create")
  create(@Body() dto: CreateTaskDto, @CurrentCompanyId() companyId: string) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.create(dto, companyId);
  }

  @Get("project/:projectId")
  @RequirePermissions("projects:read")
  findByProject(
    @Param("projectId") projectId: string,
    @CurrentCompanyId() companyId: string,
    @Query() query: FilterDto,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.findByProject(projectId, companyId, query);
  }

  @Get("activity/:activityId")
  @RequirePermissions("projects:read")
  findByActivity(
    @Param("activityId") activityId: string,
    @CurrentCompanyId() companyId: string,
  ) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.findByActivity(activityId, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("projects:state")
  toggleActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    if (!companyId) throw new Error("companyId is required");
    return this.service.toggleActive(id, companyId);
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
    @Body() dto: UpdateTaskDto,
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
