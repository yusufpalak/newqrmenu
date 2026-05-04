// Shared application types

export type Role = 'SUPERADMIN' | 'ADMIN' | 'USER';

export type Locale = 'tr' | 'en' | 'de' | 'ar' | string;

export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
  isActive?: boolean;
  tenant?: ITenant | null;
}

export interface IAuthResponse {
  accessToken: string;
  user: IAuthUser;
}

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  defaultLocale: string;
  defaultCurrencyId: string | null;
  defaultCurrency?: ICurrency | null;
  isActive: boolean;
  showPriceUpdateDate?: boolean;
  pricesUpdatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICurrency {
  id: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

export interface ITranslation {
  id?: string;
  locale: string;
  name: string;
  description?: string | null;
  ingredients?: string | null;
}

export interface ICategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  translations?: ITranslation[];
  subCategories?: ISubCategory[];
  products?: IProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubCategory {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  translations?: ITranslation[];
  products?: IProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductPrice {
  id?: string;
  productId?: string;
  currencyId: string;
  price: string | number;
  discountedPrice?: string | number | null;
  currency?: ICurrency;
}

export interface IProductNutrition {
  calories?: number | null;
  protein?: number | null;
  carbohydrate?: number | null;
  fat?: number | null;
  sugar?: number | null;
  salt?: number | null;
  allergens?: string | null;
  ingredients?: string | null;
}

export interface IProduct {
  id: string;
  tenantId: string;
  categoryId: string;
  subCategoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  prices?: IProductPrice[];
  translations?: ITranslation[];
  nutrition?: IProductNutrition | null;
  category?: ICategory;
  subCategory?: ISubCategory | null;
  createdAt?: string;
  updatedAt?: string;
}

export type TranslationRequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type TranslationRequestEntityType =
  | 'CATEGORY'
  | 'SUBCATEGORY'
  | 'PRODUCT'
  | 'FULL_MENU';

export interface ITranslationRequest {
  id: string;
  tenantId: string;
  requestedByUserId: string;
  targetLocale: string;
  entityType: TranslationRequestEntityType;
  entityId: string | null;
  status: TranslationRequestStatus;
  note: string | null;
  price: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMedia {
  id: string;
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IUploadResponse extends IMedia {}

export interface IMenuResponse {
  tenant: ITenant;
  locale: string;
  currency: ICurrency | null;
  categories: ICategory[];
}

export interface IApiError {
  statusCode?: number;
  message: string | string[];
  error?: string;
}

export interface IPublicPrice {
  amount: string;
  discountedPrice?: string | null;
  currency?: ICurrency;
}

export interface IPublicProduct extends Omit<IProduct, 'prices'> {
  price?: IPublicPrice;
}

export interface IPublicSubCategory extends Omit<ISubCategory, 'products'> {
  products?: IPublicProduct[];
}

export interface IPublicCategory extends Omit<ICategory, 'products' | 'subCategories'> {
  subCategories?: IPublicSubCategory[];
  products?: IPublicProduct[];
}

export interface IPublicMenuBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  bgColor: string;
  textColor: string;
  imageUrl?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface IPublicMenuResponse {
  tenant: ITenant;
  locale: string;
  currency: ICurrency | null;
  categories: IPublicCategory[];
  availableLocales: string[];
  availableCurrencies: ICurrency[];
  banner?: IPublicMenuBanner | null;
  popularProducts?: IPublicProduct[];
  showPriceUpdateDate?: boolean;
  pricesUpdatedAt?: string | null;
}

// ----- Blog -----

export interface IBlogTranslation {
  id?: string;
  postId?: string;
  locale: string;
  slug?: string;
  title: string;
  excerpt?: string | null;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface IBlogPost {
  id: string;
  slug: string;
  sourceLocale: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  sortOrder: number;
  tags: string | null;
  authorId: string | null;
  translations?: IBlogTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateBlogPost {
  slug?: string;
  sourceLocale: string;
  coverImage?: string | null;
  isPublished?: boolean;
  tags?: string | null;
  sortOrder?: number;
  autoTranslate?: boolean;
  translations: IBlogTranslation[];
}

// ----- Contact -----

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  locale: string;
  isRead: boolean;
  ipAddress: string | null;
  createdAt: string;
}

export interface ICreateContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  locale?: string;
}


