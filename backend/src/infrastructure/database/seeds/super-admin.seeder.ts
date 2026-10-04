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
          where: {
            code: "SUPER_ADMIN",
            companyId: IsNull(),
          },
        });

        if (!superRole) {
          superRole = manager.create(Role, {
            companyId: null,
            name: "SUPER ADMIN",
            code: "SUPER_ADMIN",
            description: "Rol global sin empresa",
            isPrincipal: true,
            isActive: true,
          } as Partial<Role>);
          superRole = await manager.save(superRole);
          this.logger.log(`✅ Rol SUPER_ADMIN global creado`);
        }

        const docNumber = "00000000";
        let superUser = await manager.findOne(User, {
          where: {
            document_number: docNumber,
            companyId: IsNull(),
          },
        });

        if (!superUser) {
          const rounds =
            this.configService.get<number>("config.bcrypt.rounds") ?? 10;
          const hashed = await bcrypt.hash("Admin123*", rounds);
          superUser = manager.create(User, {
            companyId: null,
            email: "superadmin@system.com",
            document_number: docNumber,
            first_name: "Super",
            last_name: "Admin",
            password: hashed,
            roleId: superRole.id,
            isActive: true,
          } as Partial<User>);
          await manager.save(superUser);
          this.logger.log(
            `✅ Usuario superadmin@system.com / Admin123* creado`,
          );
        } else {
          this.logger.log(`ℹ Super admin ya existe, no se crea`);
        }
      });
    } catch (e) {
      this.logger.error("Error seedeando super admin", e as Error);
    }
  }
}
