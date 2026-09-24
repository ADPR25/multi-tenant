import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../iam/users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { User } from "../iam/users/entities/user.entity";
import { Company } from "../tenant/company/entities/company.entity";
import { Role } from "../iam/roles/entities/role.entity";
import { Session } from "./entities/session.entity";
import { SessionsCleanupService } from "./tasks/sessions-cleanup.service";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Company, Role, Session]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.getOrThrow<string>("config.jwt.secret");
        const expiresIn = configService.getOrThrow<string>("config.jwt.expiresIn");
        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionsCleanupService],
})
export class AuthModule {}