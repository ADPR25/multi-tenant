import { IsString, IsNotEmpty, IsObject, IsDateString, IsOptional, IsUUID } from "class-validator";

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  survey: Record<string, unknown>;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID() 
  projectId: string
}
