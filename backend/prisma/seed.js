const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.$transaction([
    prisma.productNutrition.deleteMany(),
    prisma.productPrice.deleteMany(),
    prisma.productTranslation.deleteMany(),
    prisma.product.deleteMany(),
    prisma.subCategoryTranslation.deleteMany(),
    prisma.subCategory.deleteMany(),
    prisma.categoryTranslation.deleteMany(),
    prisma.category.deleteMany(),
    prisma.translationRequest.deleteMany(),
    prisma.media.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.currency.deleteMany(),
  ]);

  // Create currencies
  console.log('Creating currencies...');
  const tryCurrency = await prisma.currency.create({
    data: { code: 'TRY', symbol: '₺', isActive: true },
  });
  const usdCurrency = await prisma.currency.create({
    data: { code: 'USD', symbol: '$', isActive: true },
  });
  const eurCurrency = await prisma.currency.create({
    data: { code: 'EUR', symbol: '€', isActive: true },
  });

  // Create superadmin
  console.log('Creating superadmin...');
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@yusufqrmenu.com',
      password: superadminPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  // Create tenant
  console.log('Creating tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Restoran 1',
      slug: 'restoran1',
      description: 'En lezzetli yemekler burada!',
      defaultLocale: 'tr',
      defaultCurrencyId: tryCurrency.id,
      isActive: true,
    },
  });

  // Create admin user for tenant
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@restoran1.com',
      password: adminPassword,
      name: 'Restoran Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  // Create user for tenant
  console.log('Creating regular user...');
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@restoran1.com',
      password: userPassword,
      name: 'Restoran User',
      role: 'USER',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  // Create categories
  console.log('Creating categories...');
  const icecekler = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'İçecekler',
      slug: 'icecekler',
      description: 'Soğuk ve sıcak içecekler',
      sortOrder: 1,
      isActive: true,
      translations: {
        create: [
          { locale: 'en', name: 'Beverages', description: 'Cold and hot beverages' },
          { locale: 'de', name: 'Getränke', description: 'Kalte und heiße Getränke' },
        ],
      },
    },
  });

  const yemekler = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Yemekler',
      slug: 'yemekler',
      description: 'Ana yemekler ve atıştırmalıklar',
      sortOrder: 2,
      isActive: true,
      translations: {
        create: [
          { locale: 'en', name: 'Food', description: 'Main courses and snacks' },
          { locale: 'de', name: 'Speisen', description: 'Hauptgerichte und Snacks' },
        ],
      },
    },
  });

  // Create subcategories
  console.log('Creating subcategories...');
  const sogukIcecekler = await prisma.subCategory.create({
    data: {
      tenantId: tenant.id,
      categoryId: icecekler.id,
      name: 'Soğuk İçecekler',
      slug: 'soguk-icecekler',
      sortOrder: 1,
      isActive: true,
      translations: {
        create: [
          { locale: 'en', name: 'Cold Beverages' },
          { locale: 'de', name: 'Kalte Getränke' },
        ],
      },
    },
  });

  const sicakIcecekler = await prisma.subCategory.create({
    data: {
      tenantId: tenant.id,
      categoryId: icecekler.id,
      name: 'Sıcak İçecekler',
      slug: 'sicak-icecekler',
      sortOrder: 2,
      isActive: true,
      translations: {
        create: [
          { locale: 'en', name: 'Hot Beverages' },
          { locale: 'de', name: 'Heiße Getränke' },
        ],
      },
    },
  });

  const burgerler = await prisma.subCategory.create({
    data: {
      tenantId: tenant.id,
      categoryId: yemekler.id,
      name: 'Burgerler',
      slug: 'burgerler',
      sortOrder: 1,
      isActive: true,
      translations: {
        create: [
          { locale: 'en', name: 'Burgers' },
          { locale: 'de', name: 'Burger' },
        ],
      },
    },
  });

  // Create products
  console.log('Creating products...');
  const cocaCola = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: icecekler.id,
      subCategoryId: sogukIcecekler.id,
      name: 'Coca Cola',
      slug: 'coca-cola',
      description: '330ml kutu kola',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      translations: {
        create: [
          { locale: 'en', name: 'Coca Cola', description: '330ml canned cola' },
          { locale: 'de', name: 'Coca Cola', description: '330ml Dose Cola' },
        ],
      },
      prices: {
        create: [
          { currencyId: tryCurrency.id, price: 35.00 },
          { currencyId: usdCurrency.id, price: 1.20 },
          { currencyId: eurCurrency.id, price: 1.10 },
        ],
      },
      nutrition: {
        create: {
          calories: 140,
          carbohydrate: 35,
          sugar: 35,
          ingredients: 'Su, şeker, karbon dioksit, karamel rengi, fosforik asit, doğal aromalar',
        },
      },
    },
  });

  const cay = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: icecekler.id,
      subCategoryId: sicakIcecekler.id,
      name: 'Çay',
      slug: 'cay',
      description: 'Demli çay',
      isActive: true,
      sortOrder: 2,
      translations: {
        create: [
          { locale: 'en', name: 'Tea', description: 'Brewed tea' },
          { locale: 'de', name: 'Tee', description: 'Aufgebrühter Tee' },
        ],
      },
      prices: {
        create: [
          { currencyId: tryCurrency.id, price: 10.00 },
          { currencyId: usdCurrency.id, price: 0.35 },
          { currencyId: eurCurrency.id, price: 0.30 },
        ],
      },
    },
  });

  const cheeseburger = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: yemekler.id,
      subCategoryId: burgerler.id,
      name: 'Cheeseburger',
      slug: 'cheeseburger',
      description: '150gr dana köfte, cheddar peyniri, turşu, sos',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      image: 'https://via.placeholder.com/400x300?text=Cheeseburger',
      translations: {
        create: [
          { locale: 'en', name: 'Cheeseburger', description: '150g beef patty, cheddar cheese, pickles, sauce' },
          { locale: 'de', name: 'Cheeseburger', description: '150g Rinderpatty, Cheddar-Käse, Gurken, Sauce' },
        ],
      },
      prices: {
        create: [
          { currencyId: tryCurrency.id, price: 120.00 },
          { currencyId: usdCurrency.id, price: 4.00 },
          { currencyId: eurCurrency.id, price: 3.80 },
        ],
      },
      nutrition: {
        create: {
          calories: 450,
          protein: 25,
          carbohydrate: 35,
          fat: 22,
          salt: 2.5,
          allergens: 'Gluten, Süt, Susam',
          ingredients: 'Dana köfte, ekmek, cheddar peyniri, turşu, özel sos, marul, domates',
        },
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('\nDemo Users:');
  console.log('Superadmin: superadmin@yusufqrmenu.com / superadmin123');
  console.log('Admin: admin@restoran1.com / admin123');
  console.log('User: user@restoran1.com / user123');
  console.log('\nPublic Menu URL: http://localhost:3000/restoran1');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
