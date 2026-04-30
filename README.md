# SaaS QR Menu System

A production-ready, multi-tenant SaaS QR Menu system built with JavaScript. Restaurants can manage their menus, categories, products, prices, and translations. Customers scan QR codes to view digital menus.

## Tech Stack

**Backend:**
- NestJS (JavaScript)
- Prisma ORM
- MySQL
- JWT Authentication
- Passport.js

**Frontend:**
- Nuxt 3 (JavaScript)
- TailwindCSS
- Pinia (State Management)
- Vue 3

## Features

- Multi-tenant SaaS architecture
- Role-based access control (Superadmin, Admin, User)
- Public QR menu pages (/:tenantSlug)
- Multi-language content support
- Multi-currency pricing
- Product nutrition information
- Image upload support
- QR code generation
- Translation request system
- Mobile-first responsive design

## Quick Start with Docker

1. **Clone and setup environment:**
```bash
cp .env.example .env
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

3. **Run database migrations:**
```bash
docker exec -it qrmenu_backend npx prisma migrate dev
```

4. **Seed demo data:**
```bash
docker exec -it qrmenu_backend npm run prisma:seed
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Public Menu: http://localhost:3000/restoran1

## Manual Setup

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/qrmenu
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=qrmenu

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

## Demo Users

After seeding:

- **Superadmin:** superadmin@yusufqrmenu.com / superadmin123
- **Admin:** admin@restoran1.com / admin123
- **User:** user@restoran1.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user profile

### Tenants (Superadmin only)
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create tenant
- `PATCH /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### SubCategories
- `GET /api/sub-categories` - List subcategories
- `POST /api/sub-categories` - Create subcategory
- `PATCH /api/sub-categories/:id` - Update subcategory
- `DELETE /api/sub-categories/:id` - Delete subcategory

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Public Menu
- `GET /api/public/menu/:tenantSlug?locale=en&currency=USD` - Get restaurant menu

### Uploads
- `POST /api/uploads` - Upload image file

### Translation Requests
- `GET /api/translation-requests` - List requests
- `POST /api/translation-requests` - Create request
- `PATCH /api/translation-requests/:id` - Update request

## Project Structure

```
newqrmenu/
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── tenants/      # Tenant management
│   │   ├── users/        # User management
│   │   ├── categories/   # Category CRUD
│   │   ├── sub-categories/
│   │   ├── products/     # Product CRUD with prices & nutrition
│   │   ├── currencies/   # Currency management
│   │   ├── public/       # Public menu API
│   │   ├── uploads/      # File upload
│   │   └── translation-requests/
│   └── prisma/
│       └── schema.prisma
├── frontend/             # Nuxt 3 frontend
│   ├── pages/
│   │   ├── admin/        # Admin panel pages
│   │   └── [tenantSlug].vue  # Public QR menu
│   ├── layouts/
│   ├── stores/           # Pinia stores
│   └── composables/      # Vue composables
├── docker-compose.yml
└── README.md
```

## Architecture

### Multi-Tenant Design
- Each tenant (restaurant) has unique data isolation
- `tenantId` on all tenant-scoped entities
- Tenant isolation guard enforces access control
- Superadmin can access all tenants

### URL Structure
- Public menus: `/:tenantSlug` (e.g., `/restoran1`)
- Admin panel: `/admin/*`
- API routes: `/api/*`

### Role-Based Access
- **Superadmin:** Full system access
- **Admin:** Manage own tenant data
- **User:** View-only (configurable permissions)

## Development

```bash
# Backend development
cd backend
npm run start:dev

# Frontend development
cd frontend
npm run dev

# Prisma Studio (Database GUI)
cd backend
npx prisma studio
```

## Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run preview
```

## Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
