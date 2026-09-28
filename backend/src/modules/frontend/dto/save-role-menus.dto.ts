import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SidebarItem {
  @IsString() name: string;
  @IsString() title: string;
  @IsString() path: string;
  @IsString() icon: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SidebarItem)
  children?: SidebarItem[];
}

export class RouteItem {
  @IsString() path: string;
  @IsString() name: string;
  @IsOptional() @IsString() title?: string;
  @IsString() componentPath: string;
}

export class SaveRoleMenusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SidebarItem)
  sidebar: SidebarItem[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
