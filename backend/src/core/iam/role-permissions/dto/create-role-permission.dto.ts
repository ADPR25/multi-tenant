import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

export class CreateRolePermissionDto {
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @IsNotEmpty()
  @IsUUID()
  permissionId: string;

  @IsNotEmpty()
  @IsBoolean()
  canCreate: boolean;

  @IsNotEmpty()
  @IsBoolean()
  canRead: boolean;

  @IsNotEmpty()
  @IsBoolean()
  canUpdate: boolean;

  @IsNotEmpty()
  @IsBoolean()
  canDelete: boolean;
}