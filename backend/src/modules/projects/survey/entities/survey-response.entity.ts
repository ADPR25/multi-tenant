import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Survey } from "./survey.entity";
import { BaseEntity } from "@/infrastructure/database/base.entity";

@Entity("survey-response")
export class SurveyResponse extends BaseEntity {
  @Index()
  @Column({ name: "survey_id", type: "uuid", nullable: true })
  surveyId: string;

  @ManyToOne(() => Survey, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "survey_id" })
  survey?: Survey | null;

  @Column({ type: "jsonb" })
  response: Record<string, unknown>;
}
