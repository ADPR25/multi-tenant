import { IsNotEmpty, IsObject, IsUUID } from "class-validator";

export class CreateSurveyResponseDto {
  @IsObject()
  @IsNotEmpty()
  response: Record<string, unknown>;

  @IsUUID()
  surveyId: string
}
