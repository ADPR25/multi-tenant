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
import { FoldersService } from "./folders.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("folders")
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @RequirePermissions("documents:folders:create")
  create(
    @Body() dto: CreateFolderDto,
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.foldersService.create(dto, companyId, user.id);
  }

  @Post("personal")
  @RequirePermissions("documents:folders:create")
  createPersonal(
    @Body("parentId") parentId: string,
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.foldersService.createPersonal(parentId, companyId, user);
  }

  @Get()
  @RequirePermissions("documents:folders:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto & any,
    @Query("state") state?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.foldersService.findAll(companyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("documents:folders:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.foldersService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("documents:folders:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.foldersService.update(id, companyId, dto);
  }

  @Patch("active/:id")
  @RequirePermissions("documents:folders:state")
  isActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.foldersService.toggleActive(id, companyId);
  }
}
