import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanySetting } from "./entities/company-setting.entity";
import { CompanySettingsService } from "./company-settings.service";
import { CompanySettingsController } from "./company-settings.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CompanySetting])],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}
