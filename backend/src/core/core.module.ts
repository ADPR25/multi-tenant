import { Module } from "@nestjs/common";
import { TenantModule } from "./tenant/tenant.module";
import { IamModule } from "./iam/iam.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [TenantModule, IamModule, AuthModule],
    exports: [TenantModule, IamModule, AuthModule]
})
export class CoreModule {}