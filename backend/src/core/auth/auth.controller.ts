import { Controller, Post, Body } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto } from "./dto/login.dto";
import { Public } from "@/common/decorators/public.decorator";

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post("logout")
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refresh_token);
  }
}