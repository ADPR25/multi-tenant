import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DocsService } from "./docs.service";
import { CreateDocDto } from "./dto/create-doc.dto";
import { UpdateDocDto } from "./dto/update-doc.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("documents/docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  @RequirePermissions("documents:docs:create")
  create(@Body() dto: CreateDocDto, @CurrentCompanyId() companyId: string) {
    return this.docsService.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("documents:docs:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.docsService.findAll(companyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("documents:docs:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.docsService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("documents:docs:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDocDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.docsService.update(id, dto, companyId);
  }

  @Patch("active/:id")
  @RequirePermissions("documents:docs:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.docsService.toggleActive(id, companyId);
  }
}
