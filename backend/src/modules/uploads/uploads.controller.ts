import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Req,
  Query,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
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
  @Post("survey/:surveyId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadSurvey(
    @Param("surveyId") surveyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("fieldName") fieldName?: string,
  ) {
    if (!file) throw new UnauthorizedException("No file");

    let subFolder: "img" | "docs" | "signatures" = "docs";
    const nameLower = (fieldName || file.originalname || "").toLowerCase();
    if (
      nameLower.includes("firma") ||
      nameLower.includes("signature") ||
      nameLower.includes("sign")
    )
      subFolder = "signatures";
    else if (file.mimetype.startsWith("image/")) subFolder = "img";

    const saved = this.uploadsService.saveSurveyFile(surveyId, subFolder, file);
    return {
      url: `/uploads/survey/${surveyId}/${subFolder}/${saved.filename}`,
      storageKey: saved.storageKey,
      filename: saved.filename,
      subFolder,
      originalName: saved.originalName,
    };
  }

  @Public()
  @Get("survey/:surveyId/:subFolder/:filename")
  serveSurvey(
    @Param("surveyId") surveyId: string,
    @Param("subFolder") subFolder: string,
    @Param("filename") filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    const key = `survey/${surveyId}/${subFolder}/${filename}`;
    const abs = this.uploadsService.getAbsolutePath(key);
    if (!fs.existsSync(abs)) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    res.sendFile(abs);
  }

  @Public()
  @Get("docs/:companyId/:folderId/:filename")
  serve(
    @Param("companyId") companyId: string,
    @Param("folderId") folderId: string,
    @Param("filename") filename: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query("token") tokenQuery?: string,
  ): void {
    const token =
      tokenQuery ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) throw new UnauthorizedException("Token not provided");

    try {
      this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException("Invalid token", {
        cause: error as Error,
      });
    }

    const key = `docs/${companyId}/${folderId}/${filename}`;
    const abs = this.uploadsService.getAbsolutePath(key);

    if (!fs.existsSync(abs)) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    if (filename.toLowerCase().endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    }

    res.sendFile(abs);
  }

  @Public()
  @Get("docs/:companyId/:surveyId/:subFolder/:filename")
  serveSub(
    @Param("companyId") companyId: string,
    @Param("surveyId") surveyId: string,
    @Param("subFolder") subFolder: string,
    @Param("filename") filename: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query("token") tokenQuery?: string,
  ): void {
    const token =
      tokenQuery ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) throw new UnauthorizedException("Token not provided");

    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    const key = `docs/${companyId}/${surveyId}/${subFolder}/${filename}`;
    const abs = this.uploadsService.getAbsolutePath(key);

    if (!fs.existsSync(abs)) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.sendFile(abs);
  }
}
