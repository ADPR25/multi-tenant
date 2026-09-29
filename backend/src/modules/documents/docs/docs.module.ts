import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc } from './entities/doc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doc])],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule {}
