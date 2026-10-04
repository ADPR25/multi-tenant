import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
