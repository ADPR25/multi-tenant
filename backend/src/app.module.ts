import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { TenantSubscriber } from "@/infrastructure/database/subscribers/tenant.subscriber";
import configuration, { DatabaseConfig } from "@/config/configuration";
import { validationSchema } from "@/config/configuration";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuditInterceptor } from "@/infrastructure/audit/interceptors/audit.interceptor";
import { AuditModule } from "@/infrastructure/audit/audit.module";
import { Modules } from "./modules/modules.module";
import { CoreModule } from "./core/core.module";
import { SeedsModule } from "./infrastructure/database/seeds/seeds.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = config.getOrThrow<number>("config.cache.ttl");
        const max = config.getOrThrow<number>("config.cache.max");
        return {
          ttl,
          max,
        };
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 500 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const db = configService.getOrThrow<DatabaseConfig>("config.database");
        return {
          type: "postgres",
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          synchronize: db.synchronize === true || db.synchronize === "true",
          logging: db.logging,
          autoLoadEntities: db.autoLoadEntities,
          subscribers: [TenantSubscriber],
          migrationsRun: false,
        };
      },
    }),
    AuditModule,
    CoreModule,
    Modules,
    SeedsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
