import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

type MulterFile = Express.Multer.File;

interface SavedFileInfo {
  storageKey: string;
  mimeType: string;
  size: number;
  originalName: string;
  filename: string;
}

@Injectable()
export class UploadsService {
  private basePath = path.resolve(process.cwd(), "uploads");

  saveFile(
    companyId: string,
    folderId: string,
    file: MulterFile,
  ): SavedFileInfo {
    const dest = path.join(this.basePath, "docs", companyId, folderId);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filename = `${Date.now()}-${safeName}`;
    const fullPath = path.join(dest, filename);

    fs.writeFileSync(fullPath, file.buffer);

    return {
      storageKey: `docs/${companyId}/${folderId}/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      filename: filename,
    };
  }

  getAbsolutePath(storageKey: string): string {
    return path.join(this.basePath, storageKey);
  }

  deleteFile(storageKey: string): boolean {
    if (!storageKey) return false;
    try {
      const abs = this.getAbsolutePath(storageKey);
      if (fs.existsSync(abs)) {
        fs.unlinkSync(abs);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error eliminando archivo ${storageKey}`, error);
      return false;
    }
  }
}
