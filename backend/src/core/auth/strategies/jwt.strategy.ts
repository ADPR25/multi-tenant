import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CurrentUserPayload } from "@/common/decorators/current-company.decorator";

type JwtPayload = CurrentUserPayload & {
  jti?: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("config.jwt.secret"),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload?.jti) return payload;

    const isBlacklisted = await this.cacheManager.get(
      `blacklist:${payload.jti}`,
    );
    if (isBlacklisted) throw new UnauthorizedException("Token revocado");
    return payload;
  }
}
