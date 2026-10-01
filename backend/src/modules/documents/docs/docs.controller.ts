import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DocsService } from "./docs.service";
import { CreateDocDto } from "./dto/create-doc.dto";
import { UpdateDocDto } from "./dto/update-doc.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId, CurrentUser } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import * as path from "path";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("documents/docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  @RequirePermissions("documents:docs:create")
  create(
    @Body() dto: CreateDocDto,
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.docsService.create(dto, companyId, user.id);
  }

  @Post("upload")
  @RequirePermissions("documents:docs:create")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = /pdf|jpg|jpeg|png|docx|xlsx|doc|xls/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase());
        if (!ok) return cb(new Error('Tipo de archivo no permitido'), false);
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: any,
    @Body() dto: CreateDocDto,
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: any,
  ) {
    return this.docsService.createWithFile(dto, companyId, user, file);
  }

  @Get()
  @RequirePermissions("documents:docs:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto & any,
    @Query("state") state?: string,
    @Query("search") search?: string,
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.docsService.findAll(companyId, pagination, isActive, search);
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