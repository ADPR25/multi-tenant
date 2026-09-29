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
import { TypesService } from "./types.service";
import { CreateTypeDto } from "./dto/create-type.dto";
import { UpdateTypeDto } from "./dto/update-type.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("types")
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
  @RequirePermissions("documents:types:create")
  create(
    @Body() createTypeDto: CreateTypeDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.typesService.create(createTypeDto, companyId);
  }

  @Get(":state")
  @RequirePermissions("documents:types:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() pagination: PaginationDto,
    @Query("state") state?: string
  ) {
    const isActive = state !== undefined ? state === "true" : undefined;
    return this.typesService.findAll(companyId, pagination, isActive);
  }

  @Get(":id")
  @RequirePermissions("documents:types:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.typesService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("documents:types:update")
  update(
    @Param("id") id: string,
    @Body() updateTypeDto: UpdateTypeDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.typesService.update(id, updateTypeDto, companyId);
  }
}
