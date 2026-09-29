import { IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl } from "class-validator";

export class CreateDocDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  fileUrl: string;

  @IsNotEmpty()
  @IsUUID()
  folderId: string;

  @IsNotEmpty()
  @IsUUID()
  typeId: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}