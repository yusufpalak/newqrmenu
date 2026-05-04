import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';

loadEnv();

import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { Category } from '../categories/entities/category.entity';
import { CategoryTranslation } from '../categories/entities/category-translation.entity';
import { SubCategory } from '../sub-categories/entities/sub-category.entity';
import { SubCategoryTranslation } from '../sub-categories/entities/sub-category-translation.entity';
import { Product } from '../products/entities/product.entity';
import { ProductPrice } from '../products/entities/product-price.entity';
import { ProductTranslation } from '../products/entities/product-translation.entity';
import { ProductNutrition } from '../products/entities/product-nutrition.entity';
import { TranslationRequest } from '../translation-requests/entities/translation-request.entity';
import { Media } from '../media/entities/media.entity';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { BlogTranslation } from '../blog/entities/blog-translation.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { QrScan } from '../public/entities/qr-scan.entity';
import { Banner } from '../public/entities/banner.entity';
import { SiteSetting } from '../settings/entities/site-setting.entity';

export const ALL_ENTITIES = [
  Tenant,
  User,
  Currency,
  Category,
  CategoryTranslation,
  SubCategory,
  SubCategoryTranslation,
  Product,
  ProductPrice,
  ProductTranslation,
  ProductNutrition,
  TranslationRequest,
  Media,
  BlogPost,
  BlogTranslation,
  ContactMessage,
  QrScan,
  Banner,
  SiteSetting,
];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'qrmenu',
  entities: ALL_ENTITIES,
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
