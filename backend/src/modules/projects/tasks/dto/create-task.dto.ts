import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  MaxLength,
  Min,
} from "class-validator";
import { TaskStatus, TaskPriority } from "../../enums/task-status.enum";

export class CreateTaskDto {
  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsUUID()
  phaseId?: string | null;

  @IsUUID()
  activityId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  responsibleId?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsString()
  estimatedHours?: string | null;

  @IsOptional()
  @IsString()
  actualHours?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}