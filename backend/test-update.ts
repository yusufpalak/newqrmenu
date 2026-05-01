import { DataSource } from 'typeorm';
import { Product } from './src/products/entities/product.entity';
import { SubCategory } from './src/sub-categories/entities/sub-category.entity';
import { Tenant } from './src/tenants/entities/tenant.entity';
import dataSource from './src/config/typeorm.datasource';

async function test() {
  await dataSource.initialize();
  
  const tenantRepo = dataSource.getRepository(Tenant);
  const tenant = await tenantRepo.findOne({ where: { slug: 'anatolia-kebap' } });
  
  if (!tenant) {
    console.log("Tenant not found");
    process.exit(1);
  }

  const prodRepo = dataSource.getRepository(Product);
  const kola = await prodRepo.findOne({ where: { name: 'Kola', tenantId: tenant.id } });
  
  if (!kola) {
    console.log("Kola not found");
    process.exit(1);
  }
  
  const subCatRepo = dataSource.getRepository(SubCategory);
  const sogukIcecekler = await subCatRepo.findOne({ where: { name: 'Soğuk İçecekler', tenantId: tenant.id } });
  
  if (!sogukIcecekler) {
    console.log("Soğuk İçecekler not found");
    process.exit(1);
  }

  console.log("Before Update:", kola.subCategoryId);
  
  // Try to update exactly how service does it
  kola.subCategoryId = sogukIcecekler.id;
  await prodRepo.save(kola);
  
  const check = await prodRepo.findOne({ where: { id: kola.id } });
  console.log("After Update:", check?.subCategoryId);
  console.log("Expected:", sogukIcecekler.id);
  
  await dataSource.destroy();
}

test().catch(console.error);
