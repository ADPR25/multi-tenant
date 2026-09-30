import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private basePath = path.resolve(process.cwd(), 'uploads');

  saveFile(companyId: string, folderId: string, file: any) {
    const dest = path.join(this.basePath, 'docs', companyId, folderId);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const safeName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const filename = `${Date.now()}-${safeName}`;
    const fullPath = path.join(dest, filename);

    fs.writeFileSync(fullPath, file.buffer);

    return {
      storageKey: `docs/${companyId}/${folderId}/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname
    };
  }

  getAbsolutePath(storageKey: string) {
    return path.join(this.basePath, storageKey);
  }
}