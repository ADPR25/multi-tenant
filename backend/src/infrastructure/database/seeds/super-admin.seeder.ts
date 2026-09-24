import 'dotenv/config';
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { Company } from "@/core/tenant/company/entities/company.entity";
import { CompanySetting } from "@/core/tenant/company-settings/entities/company-setting.entity";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { User } from "@/core/iam/users/entities/user.entity";
import { Permission } from "@/core/iam/permissions/entities/permission.entity";
import { RolePermission } from "@/core/iam/role-permissions/entities/role-permission.entity";
import { Session } from "@/core/auth/entities/session.entity";
import { AuditLog } from "../../audit/entities/audit-log.entity";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [Company, CompanySetting, Role, User, Permission, RolePermission, Session, AuditLog],
});

async function seed() {
  await dataSource.initialize();
  console.log("🌱 Seedeando...");

  await dataSource.transaction(async (manager) => {
    let company = await manager.findOne(Company, { where: { tax_id: "900000001" } });
    if (!company) {
      company = manager.create(Company, {
        name: "Admin Corp",
        legal_name: "Admin Corp SAS",
        document_type: 1,
        tax_id: "900000001",
        email: "admin@system.com",
        phone: "3000000000",
        address: "Montería, Córdoba",
        isActive: true,
      });
      company = await manager.save(company);
      console.log(`✅ Empresa creada: ${company.id}`);
    }

    let superRole = await manager.findOne(Role, { where: { companyId: company.id, code: "SUPER_ADMIN" } });
    if (!superRole) {
      await manager.update(Role, { companyId: company.id, isPrincipal: true }, { isPrincipal: false });
      superRole = manager.create(Role, {
        companyId: company.id,
        name: "SUPER ADMIN",
        code: "SUPER_ADMIN",
        description: "Rol con acceso total",
        isPrincipal: true,
        isActive: true,
      });
      superRole = await manager.save(superRole);
      console.log(`✅ Rol SUPER_ADMIN creado`);
    }

    const basePermissions = ["companies", "iam:roles", "iam:users", "iam:permissions", "iam:role-permissions", "tenant:company-settings"];
    for (const permName of basePermissions) {
      let perm = await manager.findOne(Permission, { where: { companyId: company.id, name: permName } });
      if (!perm) {
        perm = manager.create(Permission, { companyId: company.id, name: permName, description: `Acceso a ${permName}`, module: permName.split(":")[0] });
        perm = await manager.save(perm);
      }
      const exists = await manager.findOne(RolePermission, { where: { companyId: company.id, roleId: superRole.id, permissionId: perm.id } });
      if (!exists) {
        const rp = manager.create(RolePermission, { companyId: company.id, roleId: superRole.id, permissionId: perm.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true });
        await manager.save(rp);
      }
    }

    const docNumber = "00000000";
    let superUser = await manager.findOne(User, { where: { companyId: company.id, document_number: docNumber } });
    if (!superUser) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
      superUser = manager.create(User, {
        companyId: company.id,
        email: "superadmin@system.com",
        document_number: docNumber,
        first_name: "Super",
        last_name: "Admin",
        password: await bcrypt.hash("Admin123*", rounds),
        roleId: superRole.id,
        isActive: true,
      });
      await manager.save(superUser);
      console.log(`✅ Usuario: superadmin@system.com / Admin123* / doc: ${docNumber}`);
    }
  });

  console.log("🎉 Seed completado");
  await dataSource.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });