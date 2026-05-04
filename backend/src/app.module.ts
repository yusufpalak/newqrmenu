import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './sub-categories/sub-categories.module';
import { ProductsModule } from './products/products.module';
import { TranslationRequestsModule } from './translation-requests/translation-requests.module';
import { PublicModule } from './public/public.module';
import { UploadsModule } from './uploads/uploads.module';
import { MediaModule } from './media/media.module';
import { BlogModule } from './blog/blog.module';
import { ContactModule } from './contact/contact.module';
import { TranslateModule } from './translate/translate.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    CurrenciesModule,
    CategoriesModule,
    SubCategoriesModule,
    ProductsModule,
    TranslationRequestsModule,
    PublicModule,
    UploadsModule,
    MediaModule,
    TranslateModule,
    BlogModule,
    ContactModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
