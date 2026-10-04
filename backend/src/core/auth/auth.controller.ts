import { Controller, Post, Body, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto } from "./dto/login.dto";
import { Public } from "@/common/decorators/public.decorator";
import { Request } from "express";

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 100 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 200 } })
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Throttle({ default: { ttl: 60000, limit: 200 } })
  @Post("logout")
  logout(@Body() dto: RefreshDto, @Req() req: Request) {
    const authHeader = req.headers.authorization;
    const accessToken =
      typeof authHeader === "string"
        ? authHeader.replace("Bearer ", "")
        : undefined;

    return this.authService.logout(dto.refresh_token, accessToken);
  }
}
