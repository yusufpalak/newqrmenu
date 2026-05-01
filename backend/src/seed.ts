import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './config/typeorm.datasource';
import { Currency } from './currencies/entities/currency.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { CategoryTranslation } from './categories/entities/category-translation.entity';
import { SubCategory } from './sub-categories/entities/sub-category.entity';
import { SubCategoryTranslation } from './sub-categories/entities/sub-category-translation.entity';
import { Product } from './products/entities/product.entity';
import { ProductPrice } from './products/entities/product-price.entity';
import { ProductTranslation } from './products/entities/product-translation.entity';
import { Role } from './common/enums/role.enum';

// ─── Seed data types ─────────────────────────────────────────────────────────

interface ProductDef {
  name: string;
  slug: string;
  description?: string;
  price: string;
  discountedPrice?: string;
  sortOrder: number;
  enName: string;
  enDesc?: string;
}

interface SubCategoryDef {
  name: string;
  slug: string;
  enName: string;
  sortOrder: number;
  products: ProductDef[];
}

interface CategoryDef {
  name: string;
  slug: string;
  enName: string;
  sortOrder: number;
  subCategories: SubCategoryDef[];
}

interface TenantSeedDef {
  name: string;
  slug: string;
  description: string;
  adminEmail: string;
  adminName: string;
  categories: CategoryDef[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const TENANT_DATA: TenantSeedDef[] = [
  // ══════════════════════════════════════════════════════════════════
  // TENANT 1 — Körfez Balık Evi
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Körfez Balık Evi',
    slug: 'korfez-balik',
    description: 'Taze deniz ürünleri ve geleneksel balık yemekleri',
    adminEmail: 'admin@korfezbalik.com',
    adminName: 'Körfez Admin',
    categories: [
      {
        name: 'Mezeler',
        slug: 'mezeler',
        enName: 'Appetizers',
        sortOrder: 1,
        subCategories: [
          {
            name: 'Salatalar',
            slug: 'mezeler-salatalar',
            enName: 'Salads',
            sortOrder: 1,
            products: [
              { name: 'Közlenmiş Patlıcan Salatası', slug: 'kozlenmis-patlican', description: 'Kor ateşinde pişirilmiş patlıcan, sarımsak ve zeytinyağı', price: '85.00', enName: 'Roasted Eggplant Salad', sortOrder: 1 },
              { name: 'Çoban Salatası', slug: 'coban-salatasi', description: 'Taze domates, salatalık, biber, maydanoz', price: '80.00', enName: "Shepherd's Salad", sortOrder: 2 },
              { name: 'Atom Salata', slug: 'atom-salata', description: 'Acılı yoğurt, sarımsak ve biber', price: '85.00', enName: 'Spicy Yogurt Salad', sortOrder: 3 },
            ],
          },
          {
            name: 'Deniz Ürünleri Mezeleri',
            slug: 'mezeler-deniz-urunleri',
            enName: 'Seafood Appetizers',
            sortOrder: 2,
            products: [
              { name: 'Haydari', slug: 'haydari', description: 'Sarımsaklı yoğurt, dereotu ve taze nane', price: '75.00', enName: 'Haydari Yogurt Dip', sortOrder: 1 },
              { name: 'Tarama', slug: 'tarama', description: 'Levrek yumurtası ezmesi, limon ile', price: '90.00', enName: 'Fish Roe Spread', sortOrder: 2 },
              { name: 'Midye Dolma (6 adet)', slug: 'midye-dolma', description: 'Pirinçli İstanbul midyesi, limon ile', price: '120.00', enName: 'Stuffed Mussels', sortOrder: 3 },
              { name: 'Karides Kokteyl', slug: 'karides-kokteyl', description: 'Soğuk karides, kokteyl sos ve limon', price: '150.00', enName: 'Prawn Cocktail', sortOrder: 4 },
              { name: 'Deniz Börülcesi', slug: 'deniz-borulcesi', description: 'Zeytinyağı ve limon ile sotelenmiş', price: '95.00', enName: 'Sea Purslane', sortOrder: 5 },
              { name: 'Lakerda', slug: 'lakerda', description: 'Özel tuzlanmış torik balığı, soğan ile', price: '130.00', enName: 'Cured Bonito', sortOrder: 6 },
              { name: 'Ahtapot Salatası', slug: 'ahtapot-salatasi', description: 'Zeytinyağı, kapari, kırmızı soğan', price: '160.00', enName: 'Octopus Salad', sortOrder: 7 },
            ],
          },
        ],
      },
      {
        name: 'Çorbalar',
        slug: 'corbalar',
        enName: 'Soups',
        sortOrder: 2,
        subCategories: [
          {
            name: 'Balık Çorbaları',
            slug: 'corbalar-balik',
            enName: 'Fish Soups',
            sortOrder: 1,
            products: [
              { name: 'Balık Çorbası', slug: 'balik-corbasi', description: 'Günlük taze balıktan, limon ile', price: '95.00', enName: 'Fish Soup', sortOrder: 1 },
              { name: 'İskorpit Çorbası', slug: 'iskorpit-corbasi', description: 'Akdeniz usulü, baharatlı', price: '110.00', enName: 'Scorpion Fish Soup', sortOrder: 2 },
            ],
          },
          {
            name: 'Deniz Ürünleri Çorbaları',
            slug: 'corbalar-deniz-urunleri',
            enName: 'Seafood Soups',
            sortOrder: 2,
            products: [
              { name: 'Midye Çorbası', slug: 'midye-corbasi', description: 'Kremali midye ve patates çorbası', price: '100.00', enName: 'Mussel Chowder', sortOrder: 1 },
              { name: 'Deniz Mahsulleri Çorbası', slug: 'deniz-mahsulleri-corbasi', description: 'Karışık deniz ürünleri', price: '120.00', enName: 'Seafood Bisque', sortOrder: 2 },
            ],
          },
        ],
      },
      {
        name: 'Balık & Deniz Ürünleri',
        slug: 'balik-deniz-urunleri',
        enName: 'Fish & Seafood',
        sortOrder: 3,
        subCategories: [
          {
            name: 'Izgara Balıklar',
            slug: 'balik-izgara',
            enName: 'Grilled Fish',
            sortOrder: 1,
            products: [
              { name: 'Levrek Izgara', slug: 'levrek-izgara', description: 'Günlük taze levrek, kişi başı ~400gr', price: '320.00', enName: 'Grilled Sea Bass', sortOrder: 1 },
              { name: 'Çupra Izgara', slug: 'cupra-izgara', description: 'Kişi başı ~350gr, mevsimlik', price: '290.00', enName: 'Grilled Sea Bream', sortOrder: 2 },
              { name: 'Alabalık Izgara', slug: 'alabalik-izgara', description: 'Doğadan alabalık, kişi başı', price: '220.00', enName: 'Grilled Trout', sortOrder: 3 },
              { name: 'Somon Izgara', slug: 'somon-izgara', description: 'Norveç somonu, limon tereyağlı sos', price: '380.00', enName: 'Grilled Salmon', sortOrder: 4 },
              { name: 'Lüfer Izgara', slug: 'lufer-izgara', description: 'Boğaz lüferi, mevsimsel ürün', price: '420.00', enName: 'Grilled Bluefish', sortOrder: 5 },
              { name: 'Akdeniz Usulü Levrek', slug: 'akdeniz-levrek', description: 'Zeytin, kapari ve limon ile fırında', price: '350.00', enName: 'Mediterranean Sea Bass', sortOrder: 6 },
            ],
          },
          {
            name: 'Tavalar & Kızartmalar',
            slug: 'balik-tavalar',
            enName: 'Pan-Fried & Fried',
            sortOrder: 2,
            products: [
              { name: 'Hamsi Tava', slug: 'hamsi-tava', description: 'Mısır ununda kızartılmış taze hamsi', price: '180.00', enName: 'Pan-Fried Anchovies', sortOrder: 1 },
              { name: 'Palamut Tava', slug: 'palamut-tava', description: 'Mevsiminde taze palamut', price: '200.00', enName: 'Pan-Fried Atlantic Bonito', sortOrder: 2 },
              { name: 'İstavrit Tava', slug: 'istavrit-tava', description: 'Mısır ununda kızartılmış', price: '160.00', enName: 'Pan-Fried Horse Mackerel', sortOrder: 3 },
            ],
          },
          {
            name: 'Özel Hazırlıklar',
            slug: 'balik-ozel-hazirlıklar',
            enName: 'Special Preparations',
            sortOrder: 3,
            products: [
              { name: 'Kalkan Izgara', slug: 'kalkan-izgara', description: 'Karadeniz kalkanı (mevsimsel)', price: '480.00', enName: 'Grilled Turbot', sortOrder: 1 },
              { name: 'Kılıç Şiş', slug: 'kilic-sis', description: 'Biber ve domates ile şişte ızgara', price: '350.00', enName: 'Swordfish Skewer', sortOrder: 2 },
              { name: 'Karides Güveç', slug: 'karides-guvec', description: 'Domates sos, sarımsak ve baharatlarla', price: '280.00', enName: 'Prawn Casserole', sortOrder: 3 },
              { name: 'Ahtapot Izgara', slug: 'ahtapot-izgara', description: 'Yavaş pişirilmiş, ızgarada servis', price: '260.00', enName: 'Grilled Octopus', sortOrder: 4 },
              { name: 'Midye Tava', slug: 'midye-tava', description: 'Un kaplı çıtır midye, tarator sos', price: '150.00', enName: 'Fried Mussels', sortOrder: 5 },
              { name: 'Kalamari', slug: 'kalamari', description: 'Taze kalamar, tarator ve limon ile', price: '170.00', enName: 'Calamari', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Salatalar',
        slug: 'salatalar',
        enName: 'Salads',
        sortOrder: 4,
        subCategories: [
          {
            name: 'Taze Salatalar',
            slug: 'salatalar-taze',
            enName: 'Fresh Salads',
            sortOrder: 1,
            products: [
              { name: 'Yeşil Salata', slug: 'yesil-salata', description: 'Mevsimine göre taze yeşillikler', price: '75.00', enName: 'Green Salad', sortOrder: 1 },
              { name: 'Roka Parmesan', slug: 'roka-parmesan', description: 'Roka, parmesan, kiraz domates, balzamik', price: '110.00', enName: 'Arugula Parmesan Salad', sortOrder: 2 },
              { name: 'Ton Balıklı Salata', slug: 'ton-balikli-salata', description: 'Taze ton balığı, karışık yeşillik, limon', price: '140.00', enName: 'Tuna Salad', sortOrder: 3 },
              { name: 'Mevsim Salatası', slug: 'mevsim-salatasi', description: 'Günlük taze mevsim sebzeleri', price: '85.00', enName: 'Seasonal Salad', sortOrder: 4 },
            ],
          },
        ],
      },
      {
        name: 'Tatlılar',
        slug: 'tatlilar',
        enName: 'Desserts',
        sortOrder: 5,
        subCategories: [
          {
            name: 'Geleneksel Tatlılar',
            slug: 'tatlilar-geleneksel',
            enName: 'Traditional Desserts',
            sortOrder: 1,
            products: [
              { name: 'Künefe', slug: 'kunefe', description: 'Kadayıf ve peynirli, sıcak servis', price: '130.00', enName: 'Künefe', sortOrder: 1 },
              { name: 'Muhallebi', slug: 'muhallebi', description: 'Geleneksel süt tatlısı, güllü şurup', price: '80.00', enName: 'Milk Pudding', sortOrder: 2 },
              { name: 'Dondurma (2 Top)', slug: 'dondurma', description: 'Günlük mevsimsel tatlar', price: '90.00', enName: 'Ice Cream (2 scoops)', sortOrder: 3 },
            ],
          },
        ],
      },
      {
        name: 'İçecekler',
        slug: 'icecekler',
        enName: 'Drinks',
        sortOrder: 6,
        subCategories: [
          {
            name: 'Soğuk İçecekler',
            slug: 'icecekler-soguk',
            enName: 'Cold Drinks',
            sortOrder: 1,
            products: [
              { name: 'Limonata', slug: 'limonata', description: 'Taze sıkılmış, nane ve limon', price: '45.00', enName: 'Lemonade', sortOrder: 1 },
              { name: 'Ayran', slug: 'ayran', description: 'Ev yapımı taze ayran', price: '35.00', enName: 'Yogurt Drink', sortOrder: 2 },
              { name: 'Su (500ml)', slug: 'su', description: 'Soğuk şişe su', price: '20.00', enName: 'Still Water 500ml', sortOrder: 3 },
            ],
          },
          {
            name: 'Sıcak İçecekler',
            slug: 'icecekler-sicak',
            enName: 'Hot Drinks',
            sortOrder: 2,
            products: [
              { name: 'Çay', slug: 'cay', description: 'Taze demlenmiş Türk çayı', price: '25.00', enName: 'Turkish Tea', sortOrder: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // TENANT 2 — Anatolia Kebap & Izgara
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Anatolia Kebap & Izgara',
    slug: 'anatolia-kebap',
    description: 'Geleneksel Türk kebap ve ızgara ustaları',
    adminEmail: 'admin@anatoliakebap.com',
    adminName: 'Anatolia Admin',
    categories: [
      {
        name: 'Çorbalar',
        slug: 'corbalar',
        enName: 'Soups',
        sortOrder: 1,
        subCategories: [
          {
            name: 'Tüm Çorbalar',
            slug: 'corbalar-tum',
            enName: 'All Soups',
            sortOrder: 1,
            products: [
              { name: 'Mercimek Çorbası', slug: 'mercimek-corbasi', description: 'Geleneksel kırmızı mercimek, limon ve kırmızı pul biber', price: '75.00', enName: 'Red Lentil Soup', sortOrder: 1 },
              { name: 'Domates Çorbası', slug: 'domates-corbasi', description: 'Taze domates, krema ve fesleğen', price: '70.00', enName: 'Tomato Cream Soup', sortOrder: 2 },
              { name: 'Ezogelin Çorbası', slug: 'ezogelin-corbasi', description: 'Kırmızı mercimek, bulgur, domates', price: '80.00', enName: 'Ezogelin Soup', sortOrder: 3 },
              { name: 'Paça Çorbası', slug: 'paca-corbasi', description: 'Kuzu paçası, sarımsak ve sirke', price: '95.00', enName: 'Lamb Trotter Soup', sortOrder: 4 },
              { name: 'İşkembe Çorbası', slug: 'iskembe-corbasi', description: 'Geleneksel işkembe, sarımsaklı sirke', price: '90.00', enName: 'Tripe Soup', sortOrder: 5 },
            ],
          },
        ],
      },
      {
        name: 'Başlangıçlar',
        slug: 'baslangiclar',
        enName: 'Starters',
        sortOrder: 2,
        subCategories: [
          {
            name: 'Tüm Başlangıçlar',
            slug: 'baslangiclar-tum',
            enName: 'All Starters',
            sortOrder: 1,
            products: [
              { name: 'Sigara Böreği (5 adet)', slug: 'sigara-boregi', description: 'Beyaz peynirli, çıtır yufka böreği', price: '90.00', enName: 'Crispy Cheese Rolls', sortOrder: 1 },
              { name: 'Patlıcan Ezmesi', slug: 'patlican-ezmesi', description: 'Közlenmiş patlıcan, sarımsak ve tahin', price: '85.00', enName: 'Roasted Eggplant Dip', sortOrder: 2 },
              { name: 'Acılı Ezme', slug: 'acili-ezme', description: 'Nar ekşili baharatlı domates ezmesi', price: '75.00', enName: 'Spicy Tomato Dip', sortOrder: 3 },
              { name: 'Cevizli Biber', slug: 'cevizli-biber', description: 'Muhammara — kırmızı biber, ceviz', price: '80.00', enName: 'Walnut Red Pepper Paste', sortOrder: 4 },
              { name: 'Humus', slug: 'humus', description: 'Ev yapımı nohut ezmesi, zeytinyağı ve pul biber', price: '85.00', enName: 'Hummus', sortOrder: 5 },
              { name: 'Kavurmalı Kuru Fasulye', slug: 'kavurmali-fasulye', description: 'Et kavurması ve beyaz fasulye', price: '95.00', enName: 'White Beans with Meat', sortOrder: 6 },
              { name: 'Fıstıklı Sumaklı Salata', slug: 'fistikli-sumakli-salata', description: 'Nar taneleri, Antep fıstığı ve sumak', price: '90.00', enName: 'Pistachio & Sumac Salad', sortOrder: 7 },
            ],
          },
        ],
      },
      {
        name: 'Kebaplar',
        slug: 'kebaplar',
        enName: 'Kebabs',
        sortOrder: 3,
        subCategories: [
          {
            name: 'Tüm Kebaplar',
            slug: 'kebaplar-tum',
            enName: 'All Kebabs',
            sortOrder: 1,
            products: [
              { name: 'Adana Kebap', slug: 'adana-kebap', description: 'Acılı el kıyması, kömür ateşinde', price: '220.00', enName: 'Adana Kebab', sortOrder: 1 },
              { name: 'Urfa Kebap', slug: 'urfa-kebap', description: 'Tatlı baharatlı el kıyması, yufka ile', price: '210.00', enName: 'Urfa Kebab', sortOrder: 2 },
              { name: 'Beyti Kebap', slug: 'beyti-kebap', description: 'Yufkada sarılmış kıyma kebabı, domates sosu', price: '230.00', enName: 'Beyti Kebab', sortOrder: 3 },
              { name: 'Tavuk Şiş', slug: 'tavuk-sis', description: 'Marine edilmiş tavuk göğsü, şişte', price: '180.00', enName: 'Chicken Shish Kebab', sortOrder: 4 },
              { name: 'Tavuk Kanat', slug: 'tavuk-kanat', description: 'Özel baharatlı ızgara tavuk kanat', price: '170.00', enName: 'Grilled Chicken Wings', sortOrder: 5 },
              { name: 'Kuzu Şiş', slug: 'kuzu-sis', description: 'Kuzu but, şişte kömürde', price: '260.00', enName: 'Lamb Shish Kebab', sortOrder: 6 },
              { name: 'Kuzu Pirzola', slug: 'kuzu-pirzola', description: 'Taze kuzu pirzolası, fesleğen yağı', price: '350.00', enName: 'Grilled Lamb Chops', sortOrder: 7 },
              { name: 'Izgara Köfte', slug: 'izgara-kofte', description: 'Ev yapımı ızgara köfte, soğan ve maydanoz', price: '190.00', enName: 'Grilled Meatballs', sortOrder: 8 },
              { name: 'İnegöl Köfte', slug: 'inegol-kofte', description: 'Geleneksel İnegöl usulü köfte', price: '195.00', enName: 'Inegol Meatballs', sortOrder: 9 },
              { name: 'Kaburga (Porsiyon)', slug: 'kaburga', description: 'Fırında yavaş pişirilmiş kuzu kaburga', price: '280.00', enName: 'Slow-Roasted Lamb Ribs', sortOrder: 10 },
              { name: 'Ciğer Kebap', slug: 'ciger-kebap', description: 'Taze kuzu ciğeri, domates ve biber', price: '200.00', enName: 'Liver Kebab', sortOrder: 11 },
              { name: 'Sarma Kebap', slug: 'sarma-kebap', description: 'Yağlı kuzu kuyruğuna sarılmış et', price: '240.00', enName: 'Wrapped Lamb Kebab', sortOrder: 12 },
            ],
          },
        ],
      },
      {
        name: 'Izgara',
        slug: 'izgara',
        enName: 'Grills',
        sortOrder: 4,
        subCategories: [
          {
            name: 'Tüm Izgaralar',
            slug: 'izgara-tum',
            enName: 'All Grills',
            sortOrder: 1,
            products: [
              { name: 'Bonfile', slug: 'bonfile', description: '200gr dana bonfile, mantar sos', price: '320.00', enName: 'Beef Tenderloin 200g', sortOrder: 1 },
              { name: 'Antrikot', slug: 'antrikot', description: '250gr dana antrikot, kızarmış patates', price: '290.00', enName: 'Ribeye Steak 250g', sortOrder: 2 },
              { name: 'T-Bone Steak', slug: 't-bone-steak', description: '350gr, kemikli biftek', price: '450.00', enName: 'T-Bone Steak 350g', sortOrder: 3 },
              { name: 'Karışık Izgara', slug: 'karisik-izgara', description: 'Kuzu pirzola, köfte, tavuk şiş tabağı', price: '380.00', enName: 'Mixed Grill Platter', sortOrder: 4 },
              { name: 'Kuzu But', slug: 'kuzu-but', description: 'Fırında yavaş pişirilmiş kuzu but', price: '300.00', enName: 'Slow-Roasted Lamb Leg', sortOrder: 5 },
              { name: 'Yarım Tavuk Izgara', slug: 'yarim-tavuk-izgara', description: 'Yarım tavuk, özel baharatlar', price: '220.00', enName: 'Half Grilled Chicken', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Pide & Lahmacun',
        slug: 'pide-lahmacun',
        enName: 'Pide & Lahmacun',
        sortOrder: 5,
        subCategories: [
          {
            name: 'Tüm Pide & Lahmacun',
            slug: 'pide-lahmacun-tum',
            enName: 'All Pide & Lahmacun',
            sortOrder: 1,
            products: [
              { name: 'Lahmacun', slug: 'lahmacun', description: 'İnce hamur, kıymalı ve baharatlı', price: '80.00', enName: 'Turkish Flatbread with Meat', sortOrder: 1 },
              { name: 'Kıymalı Pide', slug: 'kiymali-pide', description: 'Kıyma ve kaşar peyniri', price: '120.00', enName: 'Minced Meat Pide', sortOrder: 2 },
              { name: 'Kaşarlı Pide', slug: 'kasarli-pide', description: 'Eritilmiş kaşar peyniri', price: '110.00', enName: 'Cheese Pide', sortOrder: 3 },
              { name: 'Kuşbaşılı Pide', slug: 'kusbasili-pide', description: 'Kuşbaşı et, domates ve biber', price: '150.00', enName: 'Diced Meat Pide', sortOrder: 4 },
              { name: 'Sucuklu Yumurtalı Pide', slug: 'sucuklu-yumurtali-pide', description: 'Sucuk, yumurta ve kaşar', price: '130.00', enName: 'Sausage & Egg Pide', sortOrder: 5 },
              { name: 'Karışık Pide', slug: 'karisik-pide', description: 'Kıyma, kuşbaşı, kaşar ve yumurta', price: '160.00', enName: 'Mixed Pide', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Tatlılar',
        slug: 'tatlilar',
        enName: 'Desserts',
        sortOrder: 6,
        subCategories: [
          {
            name: 'Tüm Tatlılar',
            slug: 'tatlilar-tum',
            enName: 'All Desserts',
            sortOrder: 1,
            products: [
              { name: 'Baklava (Porsiyon)', slug: 'baklava', description: 'Antep fıstıklı, ev yapımı', price: '150.00', enName: 'Pistachio Baklava', sortOrder: 1 },
              { name: 'Sütlaç', slug: 'sutlac', description: 'Fırında karamelize sütlaç', price: '90.00', enName: 'Baked Rice Pudding', sortOrder: 2 },
              { name: 'Kadayıf', slug: 'kadayif', description: 'Tel kadayıf, kaymak ile', price: '120.00', enName: 'Shredded Wheat Dessert', sortOrder: 3 },
              { name: 'Dondurma', slug: 'dondurma', description: '2 top çikolatalı veya vanilyalı', price: '80.00', enName: 'Ice Cream (2 scoops)', sortOrder: 4 },
            ],
          },
        ],
      },
      {
        name: 'İçecekler',
        slug: 'icecekler',
        enName: 'Drinks',
        sortOrder: 7,
        subCategories: [
          {
            name: 'Soğuk İçecekler',
            slug: 'icecekler-soguk',
            enName: 'Cold Drinks',
            sortOrder: 1,
            products: [
              { name: 'Ayran', slug: 'ayran', description: 'Ev yapımı taze ayran', price: '30.00', enName: 'Yogurt Drink', sortOrder: 1 },
              { name: 'Şalgam', slug: 'salgam', description: 'Siyah şalgam suyu, acılı veya normal', price: '35.00', enName: 'Turnip Juice', sortOrder: 2 },
            ],
          },
          {
            name: 'Sıcak İçecekler',
            slug: 'icecekler-sicak',
            enName: 'Hot Drinks',
            sortOrder: 2,
            products: [
              { name: 'Türk Çayı', slug: 'turk-cayi', description: 'Rize çayı, çaydanlıkta demleme', price: '25.00', enName: 'Turkish Tea', sortOrder: 1 },
              { name: 'Türk Kahvesi', slug: 'turk-kahvesi', description: 'Geleneksel fincan, lokum ile', price: '45.00', enName: 'Turkish Coffee', sortOrder: 2 },
            ],
          },
          {
            name: 'Diğer İçecekler',
            slug: 'icecekler-diger',
            enName: 'Other Drinks',
            sortOrder: 3,
            products: [
              { name: 'Kola', slug: 'kola', description: '330ml soğuk kutu', price: '40.00', enName: 'Cola 330ml', sortOrder: 1 },
              { name: 'Su (500ml)', slug: 'su', description: 'Soğuk şişe su', price: '20.00', enName: 'Still Water 500ml', sortOrder: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // TENANT 3 — Bella Napoli Pizzeria
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Bella Napoli Pizzeria',
    slug: 'bella-napoli',
    description: 'Otantik Napoli mutfağı — odun fırınında pizza ve el yapımı makarna',
    adminEmail: 'admin@bellanapoli.com',
    adminName: 'Bella Napoli Admin',
    categories: [
      {
        name: 'Antipasti',
        slug: 'antipasti',
        enName: 'Starters',
        sortOrder: 1,
        subCategories: [
          {
            name: 'Tüm Antipasti',
            slug: 'antipasti-tum',
            enName: 'All Antipasti',
            sortOrder: 1,
            products: [
              { name: 'Bruschetta al Pomodoro', slug: 'bruschetta-pomodoro', description: 'Taze domates, fesleğen, zeytinyağı ve sarımsak', price: '120.00', enName: 'Bruschetta with Tomato & Basil', sortOrder: 1 },
              { name: 'Burrata con Prosciutto', slug: 'burrata-prosciutto', description: 'Taze burrata peyniri ve Parma jambonu', price: '250.00', enName: 'Burrata with Prosciutto', sortOrder: 2 },
              { name: 'Caprese Salatası', slug: 'caprese-salatasi', description: 'Buffalo mozzarella, domates, taze fesleğen', price: '180.00', enName: 'Caprese Salad', sortOrder: 3 },
              { name: 'Funghi Trifolati', slug: 'funghi-trifolati', description: 'Sarımsaklı sotelenmiş mantar, maydanoz', price: '150.00', enName: 'Sautéed Garlic Mushrooms', sortOrder: 4 },
              { name: 'Calamari Fritti', slug: 'calamari-fritti', description: 'Kızarmış taze kalamar, limone sos', price: '200.00', enName: 'Fried Calamari', sortOrder: 5 },
              { name: 'Antipasto Misto', slug: 'antipasto-misto', description: 'Karışık İtalyan soğuk et ve peynir tabağı', price: '280.00', enName: 'Mixed Italian Antipasto Platter', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Pizzalar',
        slug: 'pizzalar',
        enName: 'Pizzas',
        sortOrder: 2,
        subCategories: [
          {
            name: 'Klasik Pizzalar',
            slug: 'pizzalar-klasik',
            enName: 'Classic Pizzas',
            sortOrder: 1,
            products: [
              { name: 'Margherita', slug: 'margherita', description: 'San Marzano domates, fior di latte, taze fesleğen', price: '180.00', enName: 'Margherita', sortOrder: 1 },
              { name: 'Vegetariana', slug: 'vegetariana', description: 'Mevsim sebzeleri, zeytin, mozzarella', price: '185.00', enName: 'Vegetarian Pizza', sortOrder: 2 },
              { name: 'Quattro Formaggi', slug: 'quattro-formaggi', description: 'Mozzarella, gorgonzola, parmesan, ricotta', price: '220.00', enName: 'Four Cheese Pizza', sortOrder: 3 },
            ],
          },
          {
            name: 'Özel Pizzalar',
            slug: 'pizzalar-ozel',
            enName: 'Special Pizzas',
            sortOrder: 2,
            products: [
              { name: 'Diavola', slug: 'diavola', description: 'Acılı salsiccia, mozzarella, pul biber', price: '200.00', enName: 'Spicy Italian Sausage Pizza', sortOrder: 1 },
              { name: 'Pepperoni', slug: 'pepperoni', description: 'Bol pepperoni dilimi ve mozzarella', price: '210.00', enName: 'Pepperoni Pizza', sortOrder: 2 },
              { name: 'Funghi e Tartufo', slug: 'funghi-tartufo', description: 'Porcini mantar, mozzarella ve trüf yağı', price: '235.00', enName: 'Mushroom Truffle Pizza', sortOrder: 3 },
              { name: 'Prosciutto e Rucola', slug: 'prosciutto-rucola', description: 'Parma jambonu, taze roka, parmesan', price: '230.00', enName: 'Prosciutto & Arugula Pizza', sortOrder: 4 },
              { name: 'Salmone', slug: 'salmone', description: 'Füme somon, kapari, kırmızı soğan, dereotu', price: '250.00', enName: 'Smoked Salmon Pizza', sortOrder: 5 },
              { name: 'Tonno e Cipolla', slug: 'tonno-cipolla', description: 'Ton balığı, kırmızı soğan, kapari', price: '210.00', enName: 'Tuna & Onion Pizza', sortOrder: 6 },
              { name: 'BBQ Pollo', slug: 'bbq-pollo', description: 'Tavuk, BBQ sos, kırmızı soğan, mozzarella', price: '220.00', enName: 'BBQ Chicken Pizza', sortOrder: 7 },
              { name: 'Quattro Stagioni', slug: 'quattro-stagioni', description: 'Mantar, jambon, enginar, siyah zeytin', price: '225.00', enName: 'Four Seasons Pizza', sortOrder: 8 },
              { name: 'Calzone', slug: 'calzone', description: 'Kapalı pizza — ricotta, salami, mozzarella', price: '215.00', enName: 'Calzone', sortOrder: 9 },
            ],
          },
        ],
      },
      {
        name: 'Makarnalar',
        slug: 'makarnalar',
        enName: 'Pasta',
        sortOrder: 3,
        subCategories: [
          {
            name: 'Et Soslu Makarnalar',
            slug: 'makarnalar-et',
            enName: 'Meat Pasta',
            sortOrder: 1,
            products: [
              { name: 'Spaghetti Bolognese', slug: 'spaghetti-bolognese', description: 'Geleneksel 4 saatlik et sosu', price: '175.00', enName: 'Spaghetti Bolognese', sortOrder: 1 },
              { name: 'Tagliatelle al Ragù', slug: 'tagliatelle-ragu', description: 'El açması makarna, yavaş pişirilmiş et sos', price: '190.00', enName: 'Tagliatelle al Ragù', sortOrder: 2 },
              { name: 'Pappardelle al Cinghiale', slug: 'pappardelle-cinghiale', description: 'Geniş makarna, yaban domuzu sosu', price: '220.00', enName: 'Pappardelle Wild Boar', sortOrder: 3 },
            ],
          },
          {
            name: 'Deniz Ürünleri Makarnası',
            slug: 'makarnalar-deniz',
            enName: 'Seafood Pasta',
            sortOrder: 2,
            products: [
              { name: 'Linguine ai Frutti di Mare', slug: 'linguine-frutti-di-mare', description: 'Karides, midye, kalamar ve domates sos', price: '230.00', enName: 'Seafood Linguine', sortOrder: 1 },
            ],
          },
          {
            name: 'Diğer Makarnalar',
            slug: 'makarnalar-diger',
            enName: 'Other Pasta',
            sortOrder: 3,
            products: [
              { name: 'Spaghetti Carbonara', slug: 'spaghetti-carbonara', description: 'Guanciale, yumurta sarısı, pecorino romano', price: '185.00', enName: 'Spaghetti Carbonara', sortOrder: 1 },
              { name: "Penne all'Arrabbiata", slug: 'penne-arrabbiata', description: 'Acılı domates sos, sarımsak ve fesleğen', price: '160.00', enName: 'Penne Arrabbiata', sortOrder: 2 },
              { name: 'Fettuccine Alfredo', slug: 'fettuccine-alfredo', description: 'Tereyağı, parmesan ve krema', price: '180.00', enName: 'Fettuccine Alfredo', sortOrder: 3 },
              { name: 'Gnocchi al Pomodoro', slug: 'gnocchi-pomodoro', description: 'El yapımı patates gnocchi, san marzano sos', price: '170.00', enName: 'Potato Gnocchi Pomodoro', sortOrder: 4 },
              { name: 'Ravioli di Ricotta', slug: 'ravioli-ricotta', description: 'El yapımı ricotta ve ıspanak dolması', price: '200.00', enName: 'Ricotta & Spinach Ravioli', sortOrder: 5 },
              { name: 'Rigatoni alla Norma', slug: 'rigatoni-alla-norma', description: 'Patlıcan, domates, ricotta salata', price: '175.00', enName: 'Rigatoni alla Norma', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Risottolar',
        slug: 'risottolar',
        enName: 'Risottos',
        sortOrder: 4,
        subCategories: [
          {
            name: 'Tüm Risottolar',
            slug: 'risottolar-tum',
            enName: 'All Risottos',
            sortOrder: 1,
            products: [
              { name: 'Risotto ai Funghi Porcini', slug: 'risotto-funghi-porcini', description: 'Porcini mantar, parmesan, tereyağı', price: '210.00', enName: 'Porcini Mushroom Risotto', sortOrder: 1 },
              { name: 'Risotto alla Marinara', slug: 'risotto-marinara', description: 'Karides, midye, kalamar ve beyaz şarap', price: '240.00', enName: 'Seafood Risotto', sortOrder: 2 },
              { name: 'Risotto al Tartufo', slug: 'risotto-tartufo', description: 'Siyah trüf ve parmesan — şef önerisi', price: '320.00', enName: 'Black Truffle Risotto', sortOrder: 3 },
              { name: 'Risotto al Limone', slug: 'risotto-limone', description: 'Limon kabuğu, karides ve kremali sos', price: '195.00', enName: 'Lemon Prawn Risotto', sortOrder: 4 },
            ],
          },
        ],
      },
      {
        name: 'Tatlılar',
        slug: 'tatlilar',
        enName: 'Desserts',
        sortOrder: 5,
        subCategories: [
          {
            name: 'Tüm Tatlılar',
            slug: 'tatlilar-tum',
            enName: 'All Desserts',
            sortOrder: 1,
            products: [
              { name: 'Tiramisù', slug: 'tiramisu', description: 'Geleneksel tarif, mascarpone ve espresso', price: '150.00', enName: 'Tiramisù', sortOrder: 1 },
              { name: 'Panna Cotta', slug: 'panna-cotta', description: 'Vanilyalı, taze çilek sosu ile', price: '130.00', enName: 'Vanilla Panna Cotta', sortOrder: 2 },
              { name: 'Cannoli Siciliani', slug: 'cannoli-siciliani', description: 'Fıstıklı ve limonlu ricotta dolgusu', price: '140.00', enName: 'Sicilian Cannoli', sortOrder: 3 },
              { name: 'Gelato (2 Top)', slug: 'gelato', description: 'Günlük İtalyan dondurma, mevsimsel tatlar', price: '110.00', enName: 'Italian Gelato (2 scoops)', sortOrder: 4 },
            ],
          },
        ],
      },
      {
        name: 'İçecekler',
        slug: 'icecekler',
        enName: 'Drinks',
        sortOrder: 6,
        subCategories: [
          {
            name: 'Soğuk İçecekler',
            slug: 'icecekler-soguk',
            enName: 'Cold Drinks',
            sortOrder: 1,
            products: [
              { name: 'Limonata', slug: 'limonata', description: 'Taze sıkılmış, nane ve fesleğen', price: '65.00', enName: 'Fresh Basil Lemonade', sortOrder: 1 },
              { name: 'San Pellegrino', slug: 'san-pellegrino', description: '500ml İtalyan maden suyu', price: '45.00', enName: 'San Pellegrino 500ml', sortOrder: 2 },
            ],
          },
          {
            name: 'Sıcak İçecekler',
            slug: 'icecekler-sicak',
            enName: 'Hot Drinks',
            sortOrder: 2,
            products: [
              { name: 'Caffè Espresso', slug: 'caffe-espresso', description: 'Napoli usulü çift espresso', price: '55.00', enName: 'Double Espresso', sortOrder: 1 },
              { name: 'Cappuccino', slug: 'cappuccino', description: 'Kremali İtalyan cappuccino', price: '70.00', enName: 'Cappuccino', sortOrder: 2 },
            ],
          },
          {
            name: 'Diğer İçecekler',
            slug: 'icecekler-diger',
            enName: 'Other Drinks',
            sortOrder: 3,
            products: [
              { name: 'Prosecco (Kadeh)', slug: 'prosecco-kadeh', description: 'İtalyan köpüklü şarap', price: '150.00', enName: 'Prosecco Glass', sortOrder: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // TENANT 4 — Bosphorus Café
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Bosphorus Café',
    slug: 'bosphorus-cafe',
    description: 'Boğaz manzaralı kahve, kahvaltı ve tatlı durakları',
    adminEmail: 'admin@bosphoruscafe.com',
    adminName: 'Bosphorus Admin',
    categories: [
      {
        name: 'Kahvaltı',
        slug: 'kahvalti',
        enName: 'Breakfast',
        sortOrder: 1,
        subCategories: [
          {
            name: 'Tüm Kahvaltı',
            slug: 'kahvalti-tum',
            enName: 'All Breakfast',
            sortOrder: 1,
            products: [
              { name: 'Serpme Kahvaltı (2 Kişilik)', slug: 'serpme-kahvalti', description: 'Peynir çeşitleri, zeytin, bal, kaymak, reçel, tereyağ, domates, salatalık', price: '450.00', enName: 'Traditional Turkish Spread Breakfast (2 pax)', sortOrder: 1 },
              { name: 'Sahanda Yumurta', slug: 'sahanda-yumurta', description: 'Tereyağında sahanda 2 yumurta', price: '90.00', enName: 'Butter Fried Eggs', sortOrder: 2 },
              { name: 'Menemen', slug: 'menemen', description: 'Taze biber, domates ve yumurta', price: '110.00', enName: 'Menemen (Turkish Scrambled Eggs)', sortOrder: 3 },
              { name: 'Kavurmalı Yumurta', slug: 'kavurmali-yumurta', description: 'Ev yapımı et kavurması ile yumurta', price: '130.00', enName: 'Eggs with Meat Kavurma', sortOrder: 4 },
              { name: 'Peynirli Omlet', slug: 'peynirli-omlet', description: 'Kaşar ve beyaz peynir karışımı', price: '120.00', enName: 'Cheese Omelette', sortOrder: 5 },
              { name: 'Avokadolu Poşe Yumurta', slug: 'avokadolu-pose-yumurta', description: 'Ekşi maya ekmek, avokado, poşe yumurta, hollandaise', price: '150.00', enName: 'Avocado Poached Eggs on Sourdough', sortOrder: 6 },
              { name: 'Eggs Benedict', slug: 'eggs-benedict', description: 'İngiliz mafini, somon veya jambon, hollandaise', price: '170.00', enName: 'Eggs Benedict', sortOrder: 7 },
              { name: 'Tam Kahvaltı Tabağı', slug: 'tam-kahvalti-tabagi', description: 'Yumurta, sosis, sucuk, kaşar, domates, salatalık', price: '220.00', enName: 'Full Breakfast Plate', sortOrder: 8 },
            ],
          },
        ],
      },
      {
        name: 'Sıcak İçecekler',
        slug: 'sicak-icecekler',
        enName: 'Hot Drinks',
        sortOrder: 2,
        subCategories: [
          {
            name: 'Kahveler',
            slug: 'sicak-icecekler-kahve',
            enName: 'Coffee',
            sortOrder: 1,
            products: [
              { name: 'Filtre Kahve', slug: 'filtre-kahve', description: 'Günlük öğütülmüş, V60 veya chemex', price: '65.00', enName: 'Filter Coffee', sortOrder: 1 },
              { name: 'Espresso', slug: 'espresso', description: 'Çift shot', price: '60.00', enName: 'Double Espresso', sortOrder: 2 },
              { name: 'Americano', slug: 'americano', description: 'Çift espresso ve sıcak su', price: '65.00', enName: 'Americano', sortOrder: 3 },
              { name: 'Cappuccino', slug: 'cappuccino', description: 'Espresso, buharlanmış süt ve süt köpüğü', price: '80.00', enName: 'Cappuccino', sortOrder: 4 },
              { name: 'Latte', slug: 'latte', description: 'Espresso ve kremalı mikro köpüklü süt', price: '85.00', enName: 'Caffè Latte', sortOrder: 5 },
              { name: 'Flat White', slug: 'flat-white', description: 'Yoğun ristretto, az süt köpüğü', price: '80.00', enName: 'Flat White', sortOrder: 6 },
            ],
          },
          {
            name: 'Çay & Diğer Sıcak İçecekler',
            slug: 'sicak-icecekler-cay',
            enName: 'Tea & Other Hot Drinks',
            sortOrder: 2,
            products: [
              { name: 'Türk Kahvesi', slug: 'turk-kahvesi', description: 'Geleneksel çezve, lokum ile', price: '55.00', enName: 'Turkish Coffee', sortOrder: 1 },
              { name: 'Çay (Çaydanlık)', slug: 'cay-caydanlik', description: 'Rize çayı, çaydanlıkta 2 bardak', price: '50.00', enName: 'Turkish Tea Pot', sortOrder: 2 },
            ],
          },
        ],
      },
      {
        name: 'Soğuk İçecekler',
        slug: 'soguk-icecekler',
        enName: 'Cold Drinks',
        sortOrder: 3,
        subCategories: [
          {
            name: 'Kahve Bazlı Soğuk İçecekler',
            slug: 'soguk-icecekler-kahve',
            enName: 'Cold Coffee Drinks',
            sortOrder: 1,
            products: [
              { name: 'Cold Brew', slug: 'cold-brew', description: '18 saat soğuk demleme kahvesi', price: '90.00', enName: 'Cold Brew Coffee', sortOrder: 1 },
              { name: 'Iced Latte', slug: 'iced-latte', description: 'Espresso, soğuk süt ve buz', price: '95.00', enName: 'Iced Latte', sortOrder: 2 },
              { name: 'Frappuccino', slug: 'frappuccino', description: 'Blended kahve, krem şanti ve şurup', price: '100.00', enName: 'Blended Frappuccino', sortOrder: 3 },
            ],
          },
          {
            name: 'Meyve & Maden Suyu',
            slug: 'soguk-icecekler-meyve',
            enName: 'Juice & Soft Drinks',
            sortOrder: 2,
            products: [
              { name: 'Limonata', slug: 'limonata', description: 'Taze sıkılmış, nane ile servis', price: '70.00', enName: 'Fresh Mint Lemonade', sortOrder: 1 },
              { name: 'Taze Portakal Suyu', slug: 'taze-portakal-suyu', description: 'Sıkma taze portakal, 300ml', price: '85.00', enName: 'Freshly Squeezed Orange Juice', sortOrder: 2 },
              { name: 'Meyve Smoothie', slug: 'meyve-smoothie', description: 'Mevsim meyvesi, yoğurt ve bal', price: '110.00', enName: 'Seasonal Fruit Smoothie', sortOrder: 3 },
            ],
          },
        ],
      },
      {
        name: 'Sandviç & Tostlar',
        slug: 'sandvic-tostlar',
        enName: 'Sandwiches & Toasts',
        sortOrder: 4,
        subCategories: [
          {
            name: 'Tüm Sandviç & Tostlar',
            slug: 'sandvic-tostlar-tum',
            enName: 'All Sandwiches & Toasts',
            sortOrder: 1,
            products: [
              { name: 'Klasik Tost', slug: 'klasik-tost', description: 'Kaşar, sucuk ve domates', price: '90.00', enName: 'Classic Turkish Toast', sortOrder: 1 },
              { name: 'Club Sandwich', slug: 'club-sandwich', description: 'Hindi, bacon, marul, domates, mayonez', price: '160.00', enName: 'Club Sandwich', sortOrder: 2 },
              { name: 'Avokado Toast', slug: 'avokado-toast', description: 'Ekşi maya ekmek, avokado, kiraz domates, sarı biber', price: '140.00', enName: 'Avocado Toast', sortOrder: 3 },
              { name: 'Kaşar Tost', slug: 'kasar-tost', description: 'Çift taraflı eritilmiş kaşar peyniri', price: '100.00', enName: 'Melted Cheese Toast', sortOrder: 4 },
              { name: 'Focaccia Sandviç', slug: 'focaccia-sandvic', description: 'Ev yapımı focaccia, mozzarella, pesto, roka', price: '150.00', enName: 'Focaccia Sandwich', sortOrder: 5 },
              { name: 'Pastrami Roll', slug: 'pastrami-roll', description: 'Dilimlenmiş pastrami, kornişon turşu, hardal', price: '145.00', enName: 'Pastrami Roll', sortOrder: 6 },
            ],
          },
        ],
      },
      {
        name: 'Pastalar & Kekler',
        slug: 'pastalar-kekler',
        enName: 'Cakes & Pastries',
        sortOrder: 5,
        subCategories: [
          {
            name: 'Kekler',
            slug: 'pastalar-kekler-kekler',
            enName: 'Cakes',
            sortOrder: 1,
            products: [
              { name: 'New York Cheesecake', slug: 'cheesecake', description: 'Klasik cheesecake, taze çilek sosu', price: '130.00', enName: 'New York Cheesecake', sortOrder: 1 },
              { name: 'Çikolatalı Kek', slug: 'cikolatali-kek', description: 'Nemli çikolatalı kek, bitter çikolata ganajı', price: '110.00', enName: 'Chocolate Fudge Cake', sortOrder: 2 },
              { name: 'Red Velvet', slug: 'red-velvet', description: 'Kadife kek, cream cheese frosting', price: '120.00', enName: 'Red Velvet Cake', sortOrder: 3 },
              { name: 'Tiramisu', slug: 'tiramisu', description: 'Ev yapımı İtalyan klasiği', price: '140.00', enName: 'Tiramisu', sortOrder: 4 },
            ],
          },
          {
            name: 'Tart & Brownies',
            slug: 'pastalar-kekler-tart',
            enName: 'Tarts & Brownies',
            sortOrder: 2,
            products: [
              { name: 'Limonlu Tart', slug: 'limonlu-tart', description: 'Ekşi limon kreması, İsviçre merengesi', price: '115.00', enName: 'Lemon Meringue Tart', sortOrder: 1 },
              { name: 'Brownie', slug: 'brownie', description: 'Yoğun çikolatalı, cevizli, sıcak servis', price: '95.00', enName: 'Walnut Brownie', sortOrder: 2 },
            ],
          },
        ],
      },
      {
        name: 'Atıştırmalıklar & Bowl',
        slug: 'atistirmaliklar',
        enName: 'Snacks & Bowls',
        sortOrder: 6,
        subCategories: [
          {
            name: 'Tatlı Atıştırmalıklar',
            slug: 'atistirmaliklar-tatli',
            enName: 'Sweet Snacks',
            sortOrder: 1,
            products: [
              { name: 'Çikolatalı Kurabiye (2 adet)', slug: 'cikolatali-kurabiye', description: 'El yapımı, bol bitter çikolata parçalı', price: '70.00', enName: 'Double Chocolate Chip Cookies (x2)', sortOrder: 1 },
              { name: 'Waffle', slug: 'waffle', description: 'Muz, nutella, dondurma ve çilek', price: '140.00', enName: 'Waffle with Toppings', sortOrder: 2 },
              { name: 'Pancake (3 adet)', slug: 'pancake', description: 'Akçaağaç şurubu ve taze tereyağ', price: '130.00', enName: 'Buttermilk Pancakes (x3)', sortOrder: 3 },
            ],
          },
          {
            name: 'Bowllar',
            slug: 'atistirmaliklar-bowl',
            enName: 'Bowls',
            sortOrder: 2,
            products: [
              { name: 'Granola Bowl', slug: 'granola-bowl', description: 'Ev yapımı granola, Yunan yoğurdu, meyve', price: '120.00', enName: 'Granola & Yogurt Bowl', sortOrder: 1 },
              { name: 'Acai Bowl', slug: 'acai-bowl', description: 'Acai, muz, granola, çilek, hindistan cevizi', price: '150.00', enName: 'Acai Bowl', sortOrder: 2 },
              { name: 'Meyve Tabağı', slug: 'meyve-tabagi', description: 'Mevsiminde taze kesilmiş meyve seçkisi', price: '100.00', enName: 'Fresh Seasonal Fruit Plate', sortOrder: 3 },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  await dataSource.initialize();
  console.log('🌱 Seeding database...');

  // ── Currencies ──────────────────────────────────────────────────────────────
  const currencyRepo = dataSource.getRepository(Currency);
  const currencyDefs = [
    { code: 'TRY', symbol: '₺' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
  ];
  const currencies: Currency[] = [];
  for (const def of currencyDefs) {
    let c = await currencyRepo.findOne({ where: { code: def.code } });
    if (!c) c = await currencyRepo.save(currencyRepo.create(def));
    currencies.push(c);
  }
  const tryCurrency = currencies.find((c) => c.code === 'TRY')!;
  const usdCurrency = currencies.find((c) => c.code === 'USD')!;
  const eurCurrency = currencies.find((c) => c.code === 'EUR')!;

  const toUSD = (tryPrice: string): string => (parseFloat(tryPrice) / 33).toFixed(2);
  const toEUR = (tryPrice: string): string => (parseFloat(tryPrice) / 36).toFixed(2);

  // ── Superadmin ──────────────────────────────────────────────────────────────
  const userRepo = dataSource.getRepository(User);
  const supEmail = 'superadmin@yusufqrmenu.com';
  let superadmin = await userRepo.findOne({ where: { email: supEmail } });
  if (!superadmin) {
    superadmin = await userRepo.save(
      userRepo.create({
        email: supEmail,
        password: await bcrypt.hash('superadmin123', 10),
        name: 'Super Admin',
        role: Role.SUPERADMIN,
        tenantId: null,
        isActive: true,
      }),
    );
  }

  // ── Repositories ────────────────────────────────────────────────────────────
  const tenantRepo = dataSource.getRepository(Tenant);
  const catRepo = dataSource.getRepository(Category);
  const catTransRepo = dataSource.getRepository(CategoryTranslation);
  const subCatRepo = dataSource.getRepository(SubCategory);
  const subCatTransRepo = dataSource.getRepository(SubCategoryTranslation);
  const productRepo = dataSource.getRepository(Product);
  const priceRepo = dataSource.getRepository(ProductPrice);
  const productTransRepo = dataSource.getRepository(ProductTranslation);

  // ── Seed data ───────────────────────────────────────────────────────────────
  for (const tenantDef of TENANT_DATA) {
    let tenant = await tenantRepo.findOne({ where: { slug: tenantDef.slug } });
    if (!tenant) {
      tenant = await tenantRepo.save(
        tenantRepo.create({
          name: tenantDef.name,
          slug: tenantDef.slug,
          description: tenantDef.description,
          defaultLocale: 'tr',
          defaultCurrencyId: tryCurrency.id,
          isActive: true,
        }),
      );
    }

    let admin = await userRepo.findOne({ where: { email: tenantDef.adminEmail } });
    if (!admin) {
      admin = await userRepo.save(
        userRepo.create({
          email: tenantDef.adminEmail,
          password: await bcrypt.hash('admin123', 10),
          name: tenantDef.adminName,
          role: Role.ADMIN,
          tenantId: tenant.id,
          isActive: true,
        }),
      );
    }

    let totalProducts = 0;

    for (const catDef of tenantDef.categories) {
      let cat = await catRepo.findOne({
        where: { tenantId: tenant.id, slug: catDef.slug },
      });
      if (!cat) {
        cat = await catRepo.save(
          catRepo.create({
            tenantId: tenant.id,
            name: catDef.name,
            slug: catDef.slug,
            sortOrder: catDef.sortOrder,
            isActive: true,
          }),
        );
        await catTransRepo.save({ categoryId: cat.id, locale: 'en', name: catDef.enName });
      }

      for (const subCatDef of catDef.subCategories) {
        let subCat = await subCatRepo.findOne({
          where: { tenantId: tenant.id, categoryId: cat.id, slug: subCatDef.slug },
        });
        if (!subCat) {
          subCat = await subCatRepo.save(
            subCatRepo.create({
              tenantId: tenant.id,
              categoryId: cat.id,
              name: subCatDef.name,
              slug: subCatDef.slug,
              sortOrder: subCatDef.sortOrder,
              isActive: true,
            }),
          );
          await subCatTransRepo.save({
            subCategoryId: subCat.id,
            locale: 'en',
            name: subCatDef.enName,
          });
        }

        for (const prodDef of subCatDef.products) {
          let product = await productRepo.findOne({
            where: { tenantId: tenant.id, slug: prodDef.slug },
          });

          if (!product) {
            product = await productRepo.save(
              productRepo.create({
                tenantId: tenant.id,
                categoryId: cat.id,
                subCategoryId: subCat.id,
                name: prodDef.name,
                slug: prodDef.slug,
                description: prodDef.description ?? null,
                sortOrder: prodDef.sortOrder,
                isActive: true,
              }),
            );
            await productTransRepo.save({
              productId: product.id,
              locale: 'en',
              name: prodDef.enName,
              description: prodDef.enDesc ?? null,
            });
            totalProducts++;
          }

          const priceDefs = [
            { currency: tryCurrency, price: prodDef.price, discountedPrice: prodDef.discountedPrice ?? null },
            { currency: usdCurrency, price: toUSD(prodDef.price), discountedPrice: null },
            { currency: eurCurrency, price: toEUR(prodDef.price), discountedPrice: null },
          ];
          for (const pd of priceDefs) {
            const existingPrice = await priceRepo.findOne({
              where: { productId: product.id, currencyId: pd.currency.id },
            });
            if (!existingPrice) {
              await priceRepo.save({
                productId: product.id,
                currencyId: pd.currency.id,
                price: pd.price,
                discountedPrice: pd.discountedPrice,
              });
            }
          }
        }
      }
    }

    console.log(
      `  ✅ ${tenantDef.name.padEnd(28)} ${String(totalProducts).padStart(2)} yeni ürün  |  ${tenantDef.adminEmail} / admin123  →  /${tenantDef.slug}`,
    );
  }

  console.log('\n✅ Seed tamamlandı');
  console.log(`  SUPERADMIN: ${supEmail} / superadmin123`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
