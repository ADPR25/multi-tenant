import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from "class-validator";

export class CreateDocDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsUUID()
  folderId: string;

  @IsNotEmpty()
  @IsUUID()
  typeId: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  storageKey?: string;

  @IsOptional()
  mimeType?: string;

  @IsOptional()
  size?: number;

  @IsOptional()
  fileName?: string;
}
