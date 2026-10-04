import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { UsersService } from "../iam/users/users.service";
import { LoginDto } from "./dto/login.dto";
import { Role } from "../iam/roles/entities/role.entity";
import { Session } from "./entities/session.entity";
import { Company } from "../tenant/company/entities/company.entity";
import { User } from "../iam/users/entities/user.entity";
import * as crypto from "node:crypto";
import {
  LoginResponseDto,
  RefreshResponseDto,
} from "./dto/refresh-response.dto";

interface JwtPayload {
  sub: string;
  email: string;
  document_number: string;
  companyId: string | null;
  roleId: string;
  roleCode: string;
  jti: string;
}

interface DecodedToken {
  jti?: string;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private dataSource: DataSource,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generateRefreshToken(): {
    id: string;
    secret: string;
    token: string;
  } {
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(48).toString("hex");
    return { id, secret, token: `${id}.${secret}` };
  }

  private getBcryptRounds(): number {
    return this.configService.getOrThrow<number>("config.bcrypt.rounds");
  }

  private getRefreshExpiresMs(): number {
    const expiresIn =
      this.configService.get<string>("config.jwt.refreshExpiresIn") ?? "7d";
    const value = parseInt(expiresIn, 10);
    if (expiresIn.endsWith("s")) return value * 1000;
    if (expiresIn.endsWith("m")) return value * 60 * 1000;
    if (expiresIn.endsWith("h")) return value * 60 * 60 * 1000;
    if (expiresIn.endsWith("d")) return value * 24 * 60 * 60 * 1000;
    if (expiresIn.endsWith("w")) return value * 7 * 24 * 60 * 60 * 1000;
    return 7 * 24 * 60 * 60 * 1000;
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByDocumentNumber(
      dto.document_number,
    );
    if (!user) throw new UnauthorizedException("Credenciales inválidas");
    if (!user.isActive) throw new UnauthorizedException("Usuario inactivo");
    if (!user.roleId)
      throw new UnauthorizedException("Usuario sin rol asignado");

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException("Credenciales inválidas");

    const role = await this.roleRepo.findOne({ where: { id: user.roleId } });
    if (!role || !role.isActive)
      throw new UnauthorizedException("Rol inactivo");

    const isSuperAdmin = role.code === "SUPER_ADMIN";
    if (!isSuperAdmin) {
      if (!user.companyId)
        throw new UnauthorizedException("Usuario sin empresa asignada");
      const company = await this.companyRepo.findOne({
        where: { id: user.companyId },
      });
      if (!company || !company.isActive)
        throw new UnauthorizedException("Empresa inactiva");
    }

    const jti = crypto.randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      document_number: user.document_number,
      companyId: user.companyId ?? null,
      roleId: user.roleId,
      roleCode: role.code,
      jti,
    };

    const access_token = this.jwtService.sign(payload);
    const { id, secret, token } = this.generateRefreshToken();
    const familyId = crypto.randomUUID();

    const hashedSecret: string = await bcrypt.hash(
      secret,
      this.getBcryptRounds(),
    );

    const session = this.sessionRepo.create({
      id,
      companyId: user.companyId ?? null,
      userId: user.id,
      familyId,
      refreshTokenHash: hashedSecret,
      expiresAt: new Date(Date.now() + this.getRefreshExpiresMs()),
    });

    await this.sessionRepo.save(session);

    return {
      access_token,
      refresh_token: token,
      user: {
        id: user.id,
        email: user.email,
        document_number: user.document_number,
        companyId: user.companyId,
        roleId: user.roleId,
        roleCode: role.code,
        isPrincipal: role.isPrincipal,
      },
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    const [sessionId, secret] = refreshToken.split(".");
    if (!sessionId || !secret)
      throw new UnauthorizedException("Refresh inválido");

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) throw new UnauthorizedException("Refresh inválido");

    if (session.revoked) {
      await this.sessionRepo.update(
        { familyId: session.familyId },
        { revoked: true, revokedReason: "reuse_detected" },
      );
      throw new UnauthorizedException(
        "Refresh revocado por seguridad - posible robo",
      );
    }
    if (session.expiresAt < new Date())
      throw new UnauthorizedException("Refresh expirado");

    const isValid = await bcrypt.compare(secret, session.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException("Refresh inválido");

    return this.dataSource.transaction(async (manager) => {
      let user: User | null;
      if (session.companyId) {
        user = await manager.findOne(User, {
          where: {
            id: session.userId,
            companyId: session.companyId,
          },
        });
      } else {
        user = await manager.findOne(User, {
          where: {
            id: session.userId,
            companyId: IsNull(),
          },
        });
      }

      if (!user || !user.isActive)
        throw new UnauthorizedException("Usuario inactivo");

      if (session.companyId) {
        const company = await manager.findOne(Company, {
          where: { id: session.companyId },
        });
        if (!company?.isActive)
          throw new UnauthorizedException("Empresa inactiva");
      }

      const role = await manager.findOne(Role, { where: { id: user.roleId } });
      if (!role?.isActive) throw new UnauthorizedException("Rol inactivo");

      const jti = crypto.randomUUID();
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        document_number: user.document_number,
        companyId: user.companyId ?? null,
        roleId: user.roleId,
        roleCode: role?.code ?? "",
        jti,
      };

      const {
        id,
        secret: newSecret,
        token: newToken,
      } = this.generateRefreshToken();

      const newHashedSecret: string = await bcrypt.hash(
        newSecret,
        this.getBcryptRounds(),
      );

      const newSession = manager.create(Session, {
        id,
        companyId: session.companyId ?? null,
        userId: session.userId,
        familyId: session.familyId,
        refreshTokenHash: newHashedSecret,
        expiresAt: new Date(Date.now() + this.getRefreshExpiresMs()),
      });

      await manager.save(newSession);
      session.revoked = true;
      session.replacedById = newSession.id;
      await manager.save(session);

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: newToken,
      };
    });
  }

  async logout(
    refreshToken: string,
    accessToken?: string,
  ): Promise<{ message: string }> {
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode<DecodedToken>(accessToken);
        if (
          decoded &&
          typeof decoded !== "string" &&
          decoded.jti &&
          decoded.exp
        ) {
          const ttlMs = decoded.exp * 1000 - Date.now();
          if (ttlMs > 0) {
            await this.cacheManager.set(
              `blacklist:${decoded.jti}`,
              true,
              ttlMs,
            );
          }
        }
      } catch (error) {
        console.error(`No se pudo decodificar token en logout`, error);
      }
    }

    const [sessionId, secret] = refreshToken.split(".");
    if (!sessionId || !secret) return { message: "Sesión cerrada" };

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) return { message: "Sesión cerrada" };

    const isValid = await bcrypt.compare(secret, session.refreshTokenHash);
    if (!isValid) return { message: "Sesión cerrada" };

    session.revoked = true;
    session.revokedReason = "logout";
    await this.sessionRepo.save(session);
    return { message: "Sesión cerrada" };
  }
}
