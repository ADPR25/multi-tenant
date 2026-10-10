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
  @Get("public/:code")
  getPublic(@Param("code") code: string) {
    return this.service.getPublicContract(code);
  }

  @Public()
  @Post("public/:code/request-code")
  requestCode(@Param("code") code: string, @Body() dto: RequestCodeDto, @Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";
    return this.service.requestCode(code, dto.email, ip);
  }

  @Public()
  @Post("public/:code/verify")
  verify(@Param("code") code: string, @Body() dto: VerifyCodeDto, @Req() req: Request) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";
    return this.service.verifyCode(code, dto.code, ip, dto.signatureBase64);
  }
}