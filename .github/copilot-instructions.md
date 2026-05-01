# QR Menu SaaS — GitHub Copilot Instructions

## Proje Genel Bakış

Çoklu kiracı (multi-tenant) destekli, QR kod tabanlı dijital restoran menüsü SaaS uygulaması.

- **Backend:** NestJS 10 + **TypeORM 0.3** + **PostgreSQL 16** + JWT + S3 (MinIO)
- **Frontend:** Nuxt 3 + Pinia + Tailwind CSS 3 — **TAM TYPESCRIPT**
- **Storage:** MinIO (S3 uyumlu) — local `uploads/` klasörü **YOK**
- **Container:** Docker Compose (postgres, minio, minio-init, backend, frontend)

---

## TEMEL KURALLAR (HER ZAMAN UYULACAK)

1. **Tüm kod TypeScript yazılır.** Hiçbir `.js` dosyası kabul edilmez (config dosyaları dahil değil — `tailwind.config.js` istisna).
2. **Her tipte interface kullanılır.** İsimlendirme `IFoo`, `IBarResponse` şeklinde "I" prefix'iyle.
3. **DTO'lar daima class-validator dekoratörlü ve açık tipli yazılır:** `email!: string`, `price!: number`, `tenantId?: string`. Tip belirtmeden alan tanımlanmaz.
4. **N+1 sorgu yasaktır.** İlişkili veri getirilirken **tek QueryBuilder** + `leftJoinAndSelect` kullanılır.
5. **Çok kiracılı izolasyon zorunludur.** SUPERADMIN dışındaki tüm sorgular `WHERE tenantId = :tenantId` ile filtrelenir.
6. **Resimler S3/MinIO'da tutulur.** `./uploads` volume'ü yok; `Media` tablosu + `S3Service` zorunlu.
7. **Index stratejisi:** Tenant kritik tablolarda `@Index(['tenantId'])`, `@Index(['tenantId', 'isActive'])`, `@Index(['tenantId', 'sortOrder'])` zorunlu.
8. **Cascade kuralları:** `Tenant→childs CASCADE`, `Category→Products RESTRICT`, `Media/User.tenantId SET NULL`.

---

## Mimari

### Servis Portları (Docker)

| Servis | Container Port | Host Port |
|---|---|---|
| PostgreSQL | 5432 | 5432 |
| MinIO API | 9000 | 9000 |
| MinIO Console | 9001 | 9001 |
| Backend (NestJS) | 3001 | 3002 |
| Frontend (Nuxt) | 3000 | 3003 |

### Backend
- Global route prefix: `/api`
- Global `JwtAuthGuard` (APP_GUARD) — public endpoint'ler `@Public()` ile işaretlenir
- Global `ValidationPipe`: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, `enableImplicitConversion: true`
- Statik dosya servisi **YOK** — her görsel S3'ten gelir

### Frontend
- `/admin/**` → SSR kapalı (SPA modu)
- `/[tenantSlug]` → SSR açık (SEO)
- API çağrıları: `NUXT_PUBLIC_API_BASE` (browser), `NUXT_PRIVATE_API_BASE` (SSR Docker içi)
- Tüm `.vue` dosyaları `<script setup lang="ts">`
- Paylaşılan tipler: [frontend/types/index.ts](frontend/types/index.ts)

---

## Çoklu Kiracı (RBAC)

```
SUPERADMIN  → Tüm tenant'lara CRUD, status değişimi, sistem ayarları
ADMIN       → Yalnızca kendi tenantId'sinin verisi
USER        → Kısıtlı erişim
```

### JWT Payload
```ts
interface IJwtPayload { sub: string; email: string; role: Role; tenantId: string | null; }
```
JwtStrategy `validate()` döner:
```ts
interface IAuthenticatedUser { userId: string; email: string; role: Role; tenantId: string | null; }
```

### Guard Kullanımı
```ts
// Globalde JwtAuthGuard zaten APP_GUARD; @Public() ile bypass
@Public()
@Post('login') login() {...}

// Rol kontrolü
@UseGuards(RolesGuard) @Roles(Role.SUPERADMIN, Role.ADMIN)

// Tenant izolasyon (params/body/query'deki tenantId user'ınkiyle eşleşmeli)
@UseGuards(TenantIsolationGuard)
```

---

## Backend Modül Şablonu

```
src/{domain}/
  entities/
    {entity}.entity.ts          // @Entity, @Index, @Unique, OneToMany, ManyToOne
  dto/
    create-{entity}.dto.ts      // class-validator + açık tipler
    update-{entity}.dto.ts      // PartialType
  {domain}.service.ts           // Repository<T> + DataSource transactions
  {domain}.controller.ts        // Guards + @CurrentUser + ParseUUIDPipe
  {domain}.module.ts            // TypeOrmModule.forFeature([...])
```

### Servis Şablonu (Tenant izolasyonu + N+1 yok)

```ts
findAll(user: IAuthenticatedUser): Promise<Entity[]> {
  const qb = this.repo.createQueryBuilder('e')
    .leftJoinAndSelect('e.translations', 't')
    .leftJoinAndSelect('e.relation', 'r')
    .orderBy('e.sortOrder', 'ASC');
  if (user.role !== Role.SUPERADMIN) {
    qb.andWhere('e.tenantId = :tenantId', { tenantId: user.tenantId });
  }
  return qb.getMany();
}

async findOne(id: string, user: IAuthenticatedUser): Promise<Entity> {
  const e = await this.repo.findOne({ where: { id }, relations: { translations: true } });
  if (!e) throw new NotFoundException('Entity not found');
  if (user.role !== Role.SUPERADMIN && e.tenantId !== user.tenantId) {
    throw new ForbiddenException('Access denied');
  }
  return e;
}
```

### Transactional Nested Write

```ts
return this.dataSource.transaction(async (manager) => {
  const saved = await manager.getRepository(Product).save(product);
  await this.savePrices(manager, saved.id, dto.prices);
  await this.saveTranslations(manager, saved.id, dto.translations);
  return manager.getRepository(Product).findOneOrFail({ where: { id: saved.id }, relations: {...} });
});
```

### DTO Örneği (her zaman açık tip + class-validator)

```ts
export class CreateProductDto {
  @IsUUID() categoryId!: string;
  @IsString() @IsNotEmpty() @Length(1, 255) name!: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) slug?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductPriceDto) prices?: ProductPriceDto[];
}
```

---

## Veritabanı Kuralları (TypeORM + PostgreSQL)

### Ortak Alanlar
```ts
@PrimaryGeneratedColumn('uuid') id!: string;
@Column({ type: 'uuid' }) tenantId!: string;
@Column({ default: true }) isActive!: boolean;
@Column({ default: 0 }) sortOrder!: number;
@CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
@UpdateDateColumn({ type: 'timestamptz' }) updatedAt!: Date;
```

### Index ve Unique
- Tenant verisi: `@Index(['tenantId'])`, `@Index(['tenantId', 'isActive'])`, `@Index(['tenantId', 'sortOrder'])`
- Slug: `@Unique('UQ_x_tenant_slug', ['tenantId', 'slug'])`
- Translation: `@Unique(['{entity}Id', 'locale'])`

### Numeric Alanlar
PostgreSQL `numeric(p,s)` kolonu TypeORM'da **string** olarak gelir:
```ts
@Column({ type: 'numeric', precision: 10, scale: 2 }) price!: string;
// kayıt: { price: '85.00' }  // .toFixed(2) ile string'e çevir
```

### Çoklu Dil
Her çevrilebilir entity için ayrı `{Entity}Translation` modeli:
```ts
@Unique(['{entity}Id', 'locale'])
class CategoryTranslation {
  @Column() locale!: string;   // "tr", "en", "de", "ar"
  @Column() name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
}
```
Public servis tek QueryBuilder ile locale'a göre çekiyor:
```ts
.leftJoinAndSelect('p.translations', 'pt', 'pt.locale = :locale', { locale })
```
Çeviri yoksa fallback: `entity.name`.

### Migration
```bash
npm run migration:generate -- src/migrations/{ad}
npm run migration:run
```
Geliştirme: `DB_SYNC=true` (otomatik schema sync). Production: kapalı, migrasyon ile.

---

## S3 / MinIO

- `S3Service` (`src/storage/s3.service.ts`): `@aws-sdk/client-s3` ile.
- `forcePathStyle: true`, MinIO için zorunlu.
- Yükleme endpoint'i: `POST /api/uploads` (FileInterceptor + memoryStorage)
- Yanıt: `{ id, key, url, size, mimeType, originalName }`
- DB'de `Media` tablosunda kayıt tutulur (tenantId + userId + key + url).
- Public URL: `${S3_PUBLIC_ENDPOINT}/${bucket}/${key}` (örn. `http://localhost:9000/qrmenu/general/...jpg`)
- Presigned URL desteği için `S3_USE_PRESIGNED=true` env'i.

Frontend kullanım:
```ts
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'products');
const { url } = await api.upload<IUploadResponse>('/uploads', formData);
// url tam, S3 public URL — direkt <img :src="url"> kullan
```

---

## Frontend (TypeScript)

### Proje Tipleri
[frontend/types/index.ts](frontend/types/index.ts) — `IAuthUser`, `IAuthResponse`, `ITenant`, `ICategory`, `ISubCategory`, `IProduct`, `IProductPrice`, `IProductNutrition`, `ICurrency`, `ITranslation`, `IMenuResponse`, `ITranslationRequest`, `IMedia`, `IUploadResponse`, `IApiError`, `Role`.

### useApi Composable
```ts
const api = useApi();
const products = await api.get<IProduct[]>('/products');
const created = await api.post<IProduct, CreateProductDto>('/products', payload);
await api.patch<IProduct>('/products/' + id, payload);
await api.delete('/products/' + id);
const upload = await api.upload<IUploadResponse>('/uploads', formData);
```
Token otomatik `Authorization: Bearer ...` header'ına eklenir.

### Auth Store (Pinia, typed)
```ts
const auth = useAuthStore();
auth.isAuthenticated  // boolean
auth.isAdmin          // boolean (ADMIN | SUPERADMIN)
auth.isSuperAdmin     // boolean
auth.user             // IAuthUser | null
auth.currentTenant    // ITenant | null
auth.token            // string | null
await auth.login(email, password)
auth.logout()
auth.setTenant(tenant: ITenant)
```

### Vue Component Şablonu
```vue
<script setup lang="ts">
import type { IProduct } from '~/types';

const products = ref<IProduct[]>([]);
const loading = ref<boolean>(false);

const api = useApi();

async function load(): Promise<void> {
  loading.value = true;
  try {
    products.value = await api.get<IProduct[]>('/products');
  } finally {
    loading.value = false;
  }
}

onMounted(() => void load());
</script>
```

---

## Ortam Değişkenleri

### Backend (.env) — bkz. [backend/.env.example](backend/.env.example)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=qrmenu
DB_SYNC=true
DB_LOGGING=false
JWT_SECRET=...
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3003
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=KrnlQrM!92xZ
S3_SECRET_KEY=KrnlQrM!92xZ
S3_BUCKET=qrmenu
S3_FORCE_PATH_STYLE=true
S3_USE_PRESIGNED=false
```

### Frontend (.env)
```env
NUXT_PUBLIC_API_BASE=http://localhost:3002
NUXT_PRIVATE_API_BASE=http://backend:3001
```

---

## Seed Verileri (`backend/src/seed.ts`)

```bash
cd backend
npm run seed
```

| Email | Şifre | Rol |
|---|---|---|
| superadmin@yusufqrmenu.com | superadmin123 | SUPERADMIN |
| admin@restoran1.com | admin123 | ADMIN (restoran1) |

Para birimleri: TRY (₺), USD ($), EUR (€). Örnek tenant: `restoran1` → `/restoran1`.

---

## Geliştirme

```bash
# Hepsi tek komut
docker-compose up --build

# Yalnızca backend (postgres + minio çalışır olmalı)
cd backend
npm install
npm run start:dev
npm run seed

# Yalnızca frontend
cd frontend
npm install
npm run dev
```

### Migration
```bash
cd backend
npm run migration:generate -- src/migrations/AddSomething
npm run migration:run
npm run migration:revert
```

---

## Yeni Özellik Ekleme Adımları

### Backend
1. `src/{domain}/entities/{entity}.entity.ts` → tipli, indexli, ilişkili.
2. `dto/create-*.dto.ts`, `dto/update-*.dto.ts` → class-validator + açık tipler.
3. `src/config/typeorm.datasource.ts` → `ALL_ENTITIES` listesine ekle.
4. `{domain}.service.ts` → `Repository<T>` + tenant izolasyonu + N+1'siz QueryBuilder.
5. Nested write varsa `dataSource.transaction(...)`.
6. `{domain}.controller.ts` → `JwtAuthGuard` zaten global; sadece `RolesGuard`+`@Roles(...)` ekle. Public ise `@Public()`.
7. `{domain}.module.ts` → `TypeOrmModule.forFeature([Entity, ...])`.
8. `src/app.module.ts` → modülü import et.

### Frontend
1. Tip [frontend/types/index.ts](frontend/types/index.ts)'e ekle (eğer yeni varlıksa).
2. `pages/admin/{page}.vue` → `<script setup lang="ts">`, `useApi()` ve `useAuthStore()`.
3. SSR kapalı tüm `/admin/**`'da (routeRules zaten ayarlı).

---

## Güvenlik Kontrol Listesi

- ✅ JWT_SECRET production'da güçlü, rastgele.
- ✅ CORS sadece izinli origin'lere açık.
- ✅ Tüm tenant endpoint'leri `TenantIsolationGuard` veya servis seviyesinde `tenantId` filtreli.
- ✅ Şifreler bcryptjs (10 salt round).
- ✅ ValidationPipe whitelist + forbidNonWhitelisted aktif.
- ✅ Dosya yükleme endpoint'i JWT korumalı, mime-type doğrulamalı.
- ✅ ParseUUIDPipe ile id parametreleri doğrulanır.
- ✅ SUPERADMIN-only endpoint'lerde `RolesGuard` + `@Roles(Role.SUPERADMIN)`.
