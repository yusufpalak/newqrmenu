import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { BannersController } from './banners.controller';
import { PublicService } from './public.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Category } from '../categories/entities/category.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { Product } from '../products/entities/product.entity';
import { QrScan } from './entities/qr-scan.entity';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Category, Currency, Product, QrScan, Banner])],
  controllers: [PublicController, BannersController],
  providers: [PublicService],
})
export class PublicModule {}
