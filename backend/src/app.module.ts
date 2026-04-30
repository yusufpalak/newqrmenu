import {  Module  } from '@nestjs/common';
import {  ConfigModule  } from '@nestjs/config';
import {  DatabaseModule  } from './database/database.module';
import {  AuthModule  } from './auth/auth.module';
import {  UsersModule  } from './users/users.module';
import {  TenantsModule  } from './tenants/tenants.module';
import {  CategoriesModule  } from './categories/categories.module';
import {  SubCategoriesModule  } from './sub-categories/sub-categories.module';
import {  ProductsModule  } from './products/products.module';
import {  CurrenciesModule  } from './currencies/currencies.module';
import {  PublicModule  } from './public/public.module';
import {  UploadsModule  } from './uploads/uploads.module';
import {  TranslationRequestsModule  } from './translation-requests/translation-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    CategoriesModule,
    SubCategoriesModule,
    ProductsModule,
    CurrenciesModule,
    PublicModule,
    UploadsModule,
    TranslationRequestsModule,
  ],
})
export class AppModule {}
