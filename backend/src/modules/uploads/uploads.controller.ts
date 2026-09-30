import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import * as fs from "fs";
import { Public } from "@/common/decorators/public.decorator";

@Controller("uploads")
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Get("docs/:companyId/:folderId/:filename")
  async serve(
    @Param("companyId") companyId: string,
    @Param("folderId") folderId: string,
    @Param("filename") filename: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query("token") tokenQuery?: string,
  ) {
    const token =
      tokenQuery ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) throw new UnauthorizedException("Token no proporcionado");

    try {
      this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException("Token inválido");
    }

    const key = `docs/${companyId}/${folderId}/${filename}`;
    const abs = this.uploadsService.getAbsolutePath(key);
    if (!fs.existsSync(abs))
      return res.status(404).json({ message: "Archivo no encontrado" });

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    if (filename.toLowerCase().endsWith(".pdf"))
      res.setHeader("Content-Type", "application/pdf");

    return res.sendFile(abs);
  }
}
