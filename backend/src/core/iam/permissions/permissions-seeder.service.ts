/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";

@Injectable()
export class PermissionsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeeder.name);

  constructor(private readonly permissionsService: PermissionsService) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log("🔄 Sincronizando permisos desde ACCESS_CATALOG...");
      const result = await this.permissionsService.syncAllCompanies();

      this.logger.log(
        `✅ Permisos sincronizados: ${result.companiesProcessed} empresas`,
      );
      for (const d of result.details) {
        if (d.created > 0) {
          this.logger.log(
            ` -> Empresa ${d.companyId}: +${d.created} nuevos permisos`,
          );
        }
      }
    } catch (e) {
      this.logger.error("Error auto-sincronizando permisos", e as Error);
    }
  }
}
