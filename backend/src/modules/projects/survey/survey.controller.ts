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
import { Public } from "@/common/decorators/public.decorator";
import { CreateSurveyResponseDto } from "./dto/create-response.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("surveys")
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @RequirePermissions("survey:create")
  create(@Body() dto: CreateSurveyDto, @CurrentCompanyId() companyId: string) {
    return this.surveyService.create(dto, companyId);
  }

  @Public()
  @Post("/response")
  createResponse(@Body() dto: CreateSurveyResponseDto) {
    return this.surveyService.createResponse(dto);
  }

  @Get()
  @RequirePermissions("survey:read")
  findAll(@CurrentCompanyId() companyId: string, @Query() filter: FilterDto) {
    const isActive =
      filter.state !== undefined ? filter.state === "true" : undefined;
    return this.surveyService.findAll(
      companyId,
      filter,
      isActive,
      filter.search,
      filter.find,
    );
  }

  @Public()
  @Get("by-code/:code")
  findByCode(@Param("code") code: string) {
    return this.surveyService.findByCode(code);
  }

  @Public()
  @Get("by-char/:surveyId")
  findByChar(@Param("surveyId") surveyId: string) {
    return this.surveyService.findByChar(surveyId);
  }

  @Get(":id")
  @RequirePermissions("survey:read")
  findOne(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
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
  remove(@Param("id") id: string, @CurrentCompanyId() companyId: string) {
    return this.surveyService.remove(id, companyId);
  }
}
