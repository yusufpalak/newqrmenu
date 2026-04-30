import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Category } from '../categories/entities/category.entity';
import { Currency } from '../currencies/entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Category, Currency])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
