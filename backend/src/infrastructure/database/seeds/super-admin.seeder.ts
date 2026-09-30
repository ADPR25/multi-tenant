import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource, IsNull } from "typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { User } from "@/core/iam/users/entities/user.entity";

@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    try {
      await this.dataSource.transaction(async (manager) => {
        let superRole = await manager.findOne(Role, {
          where: { code: "SUPER_ADMIN", companyId: IsNull() } as any,
        });

        if (!superRole) {
          superRole = manager.create(Role, {
            companyId: null as any,
            name: "SUPER ADMIN",
            code: "SUPER_ADMIN",
            description: "Rol global sin empresa",
            isPrincipal: true,
            isActive: true,
          });
          superRole = await manager.save(superRole);
          this.logger.log(`✅ Rol SUPER_ADMIN global creado`);
        }

        const docNumber = "00000000";
        let superUser = await manager.findOne(User, {
          where: { document_number: docNumber, companyId: IsNull() } as any,
        });

        if (!superUser) {
          const rounds = this.configService.get<number>("config.bcrypt.rounds") || 10;
          superUser = manager.create(User, {
            companyId: null as any,
            email: "superadmin@system.com",
            document_number: docNumber,
            first_name: "Super",
            last_name: "Admin",
            password: await bcrypt.hash("Admin123*", rounds),
            roleId: superRole.id,
            isActive: true,
          });
          await manager.save(superUser);
          this.logger.log(`✅ Usuario superadmin@system.com / Admin123* creado`);
        } else {
          this.logger.log(`ℹ️ Super admin ya existe, no se crea`);
        }
      });
    } catch (e) {
      this.logger.error("Error seedeando super admin", e);
    }
  }
}