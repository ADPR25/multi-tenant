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
import { SurveyService } from "./survey.service";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { CurrentCompanyId } from "@/common/decorators/current-company.decorator";
import { FilterDto } from "@/common/filters/filter.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("surveys")
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @RequirePermissions("survey:create")
  create(
    @Body() dto: CreateSurveyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.surveyService.create(dto, companyId);
  }

  @Get()
  @RequirePermissions("survey:read")
  findAll(
    @CurrentCompanyId() companyId: string,
    @Query() filter: FilterDto,
  ) {
    const isActive =
      filter.state !== undefined ? filter.state === "true" : undefined;
    return this.surveyService.findAll(
      companyId,
      filter,
      isActive,
      filter.search,
    );
  }

  @Get(":id")
  @RequirePermissions("survey:read")
  findOne(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.surveyService.findOne(id, companyId);
  }

  @Patch(":id")
  @RequirePermissions("survey:update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateSurveyDto,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.surveyService.update(id, dto, companyId);
  }

  @Delete(":id")
  @RequirePermissions("survey:delete")
  remove(
    @Param("id") id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.surveyService.remove(id, companyId);
  }
}