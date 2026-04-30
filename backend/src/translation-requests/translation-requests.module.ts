import {  Module  } from '@nestjs/common';
import {  TranslationRequestsService  } from './translation-requests.service';
import {  TranslationRequestsController  } from './translation-requests.controller';

@Module({
  controllers: [TranslationRequestsController],
  providers: [TranslationRequestsService],
})
export class TranslationRequestsModule {}
