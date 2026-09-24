import { Module } from "@nestjs/common";
import { CompanyModule } from "./company/company.module";
import { CompanySettingsModule } from "./company-settings/company-settings.module";

@Module({
  imports: [CompanyModule, CompanySettingsModule],
  exports: [CompanyModule, CompanySettingsModule],
})
export class TenantModule {}
