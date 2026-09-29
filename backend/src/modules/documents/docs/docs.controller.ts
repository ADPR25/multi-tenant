import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
@Controller("docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  @RequirePermissions("documents:docs:read")
  create(
    @Body() createDocDto: CreateDocDto,
    @CurrentCompanyId() copmpanyId: string,
  ) {
    return this.docsService.create(createDocDto, copmpanyId);
  }

  @Get(":state")
  @RequirePermissions("documents:docs:read")
  findAll(
    @CurrentCompanyId() copmpanyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.docsService.findAll(copmpanyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("documents:docs:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() copmpanyId: string) {
    return this.docsService.findOne(id, copmpanyId);
  }

  @Patch(":id")
  @RequirePermissions("documents:docs:read")
  update(
    @Param("id") id: string,
    @Body() updateDocDto: UpdateDocDto,
    @CurrentCompanyId() copmpanyId: string,
  ) {
    return this.docsService.update(id, updateDocDto, copmpanyId);
  }

  @Patch("active/:id")
  @RequirePermissions("documents:folders:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.docsService.toggleActive(id, companyId);
  }
}
