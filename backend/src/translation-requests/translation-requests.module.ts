import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationRequestsController } from './translation-requests.controller';
import { TranslationRequestsService } from './translation-requests.service';
import { TranslationRequest } from './entities/translation-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TranslationRequest])],
  controllers: [TranslationRequestsController],
  providers: [TranslationRequestsService],
  exports: [TranslationRequestsService],
})
export class TranslationRequestsModule {}
