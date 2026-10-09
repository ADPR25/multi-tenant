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
import { ThirdPartiesService } from "./third-parties.service";
import { CreateThirdPartyDto } from "./dto/create-third-party.dto";
import { UpdateThirdPartyDto } from "./dto/update-third-party.dto";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { FilterDto } from "@/common/filters/filter.dto";
import { ThirdPartyType } from "./enums/third-party-type.enum";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("third-parties")
export class ThirdPartiesController {
  constructor(private readonly service: ThirdPartiesService) {}

  @Post()
  @RequirePermissions("third-parties:create")
  create(
    @Body() dto: CreateThirdPartyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("third-parties:read")
  findAll(@CurrentCompanyId() companyId: string, @Query() query: FilterDto) {
    const isActive =
      query.state !== undefined ? query.state === "true" : undefined;
    return this.service.findAll(companyId, query, isActive);
  }

  @Get("select/all")
  @RequirePermissions("third-parties:read")
  findForSelect(
    @CurrentCompanyId() companyId: string,
    @Query("tipo") tipo?: ThirdPartyType,
  ) {
    return this.service.findForSelect(companyId, tipo);
  }

  @Patch("active/:id")
  @RequirePermissions("third-parties:state")
  toggleActive(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.toggleActive(id, companyId);
  }

  @Get(":id")
  @RequirePermissions("third-parties:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.service.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("third-parties:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateThirdPartyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.update(id, dto, companyId);
  }
}
