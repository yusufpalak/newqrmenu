# Quick Start Guide

## Prerequisites
- Node.js 18+
- MySQL 8+ (or Docker)
- npm or yarn

## Option 1: Docker (Recommended)

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Wait for MySQL to be ready, then run migrations:**
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
- Public Menu Demo: http://localhost:3000/restoran1

## Option 2: Manual Setup

### 1. Setup Database

Create a MySQL database:
```sql
CREATE DATABASE qrmenu;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "DATABASE_URL=mysql://root:password@localhost:3306/qrmenu" > .env
echo "JWT_SECRET=your-secret-key" >> .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend will be running at: http://localhost:3001

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: http://localhost:3000

## Demo Credentials

After seeding the database:

### Superadmin
- Email: superadmin@yusufqrmenu.com
- Password: superadmin123
- Access: Full system access

### Restaurant Admin
- Email: admin@restoran1.com
- Password: admin123
- Access: Manage restoran1 data

### Restaurant User
- Email: user@restoran1.com
- Password: user123
- Access: View only

## Test the Application

1. **Login to Admin Panel:**
   - Go to http://localhost:3000/admin/login
   - Login with admin@restoran1.com / admin123

2. **View Public Menu:**
   - Go to http://localhost:3000/restoran1
   - See the digital menu with categories and products

3. **Test API:**
   ```bash
   # Login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@restoran1.com","password":"admin123"}'
   
   # Get categories (use token from login response)
   curl http://localhost:3001/api/categories \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Get public menu
   curl http://localhost:3001/api/public/menu/restoran1
   ```

## Common Issues

### Database Connection Error
- Make sure MySQL is running
- Check DATABASE_URL in .env
- Verify database exists

### Port Already in Use
- Backend (3001): Change PORT in .env
- Frontend (3000): Change in nuxt.config.js
- MySQL (3306): Change in docker-compose.yml

### Prisma Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

## Next Steps

1. Customize the restaurant name and slug
2. Add your own categories and products
3. Upload product images
4. Configure translations
5. Generate QR codes
6. Deploy to production

## Production Deployment

### Backend
```bash
cd backend
npm run build
NODE_ENV=production npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Support

For issues:
1. Check the README.md
2. Review API endpoints documentation
3. Check Prisma schema for data models
4. Review backend logs for errors

Good luck with your QR Menu system!
