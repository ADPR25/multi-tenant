
import { Controller, Post, Body, Param, Get, Req, UseGuards } from "@nestjs/common";
import { SignaturesService } from "./signatures.service";
import { RequestCodeDto } from "./dto/request-code.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { Public } from "@/common/decorators/public.decorator";
import { Request } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("signatures")
export class SignaturesController {
  constructor(private readonly service: SignaturesService) {}

  @Public()
  @Get("public/:codigo")
  getPublic(@Param("codigo") codigo: string) {
    return this.service.getPublicContract(codigo);
  }

  @Public()
  @Post("public/:codigo/request-code")
  requestCode(@Param("codigo") codigo: string, @Body() dto: RequestCodeDto, @Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";
    return this.service.requestCode(codigo, dto.email, ip);
  }

  @Public()
  @Post("public/:codigo/verify")
  verify(@Param("codigo") codigo: string, @Body() dto: VerifyCodeDto, @Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";
    return this.service.verifyCode(codigo, dto.codigo, ip, dto.firmaBase64);
  }
}
