import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyResponse])],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService]
})
export class SurveyModule {}
