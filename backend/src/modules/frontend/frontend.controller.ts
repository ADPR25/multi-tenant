import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { FrontendService } from "./frontend.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RequirePermissions } from "@/common/decorators/permissions.decorator";
import {
  CurrentCompanyId,
  CurrentUser,
  CurrentUserPayload,
} from "@/common/decorators/current-company.decorator";
import { SaveRoleMenusDto } from "./dto/save-role-menus.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("frontend")
export class FrontendController {
  constructor(private readonly service: FrontendService) {}

  @Get("sidebar")
  getSidebar(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getForRole(
      user.roleId,
      user.roleCode || user.code || "",
      user.companyId ?? null,
    );
  }

  @Get("routes")
  getRoutes(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getRoutesForRole(
      user.roleId,
      user.roleCode || user.code || "",
      user.companyId ?? null,
    );
  }

  @Get("sidebar/raw")
  @RequirePermissions("iam:roles:read")
  getRaw() {
    return this.service.getRaw();
  }

  @Get("routes/raw")
  @RequirePermissions("iam:roles:read")
  getRoutesRaw() {
    return this.service.getRoutesRaw();
  }

  @Get("roles/:roleId/raw")
  @RequirePermissions("iam:roles:read")
  getRoleRaw(
    @Param("roleId", ParseUUIDPipe) id: string,
    @CurrentCompanyId() companyId: string,
  ) {
    return this.service.getRawForRole(id, companyId);
  }

  @Get("roles/:roleId/assignment-data")
  @RequirePermissions("iam:roles:read")
  getAssignment(
    @Param("roleId", ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.getAssignmentData(id, user);
  }

  @Put("roles/:roleId/menus")
  @RequirePermissions("iam:roles:update")
  save(
    @Param("roleId", ParseUUIDPipe) id: string,
    @Body() body: SaveRoleMenusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.saveForRole(id, body.sidebar, user, body.permissions);
  }
}
