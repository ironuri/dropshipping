import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const categoryData = [
    { slug: "solares", nameEs: "Protección Solar", name: "Sun Care" },
    { slug: "solares-facial", nameEs: "Solar Facial", name: "Facial Sun Care", parentSlug: "solares" },
    { slug: "solares-corporal", nameEs: "Solar Corporal", name: "Body Sun Care", parentSlug: "solares" },
    { slug: "after-sun", nameEs: "After Sun", name: "After Sun", parentSlug: "solares" },
    { slug: "eco-mineral", nameEs: "Eco & Mineral Solar", name: "Eco & Mineral Solar", parentSlug: "solares" },
    { slug: "skincare", nameEs: "Skincare", name: "Skincare" },
    { slug: "serums", nameEs: "Sérums y Tratamientos", name: "Serums & Treatments", parentSlug: "skincare" },
    { slug: "hidratantes", nameEs: "Hidratantes", name: "Moisturizers", parentSlug: "skincare" },
    { slug: "limpiadores", nameEs: "Limpiadores", name: "Cleansers", parentSlug: "skincare" },
    { slug: "contorno-ojos", nameEs: "Contorno de Ojos", name: "Eye Care", parentSlug: "skincare" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        name: cat.name,
        nameEs: cat.nameEs,
        parentId: cat.parentSlug ? categoryMap[cat.parentSlug] : undefined,
      },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log("✅ Categories created");

  // BigBuy Products
  const bigbuyProducts = [
    { name: "Fotoprotector Fusion Water SPF50 50ml", brand: "ISDIN", sku: "BB-ISDIN-001", cost: 11.00, retail: 19.99, category: "solares-facial", spf: 50, tags: ["solar", "facial", "spf50", "isdin"] },
    { name: "Heliocare 360° Gel Oil-Free SPF50+ 50ml", brand: "Heliocare", sku: "BB-HEL-001", cost: 14.00, retail: 25.99, category: "solares-facial", spf: 50, tags: ["solar", "facial", "spf50", "heliocare", "oil-free"] },
    { name: "Anthelios UV-MUNE 400 SPF50+ 50ml", brand: "La Roche-Posay", sku: "BB-LRP-001", cost: 16.00, retail: 28.99, category: "solares-facial", spf: 50, tags: ["solar", "facial", "spf50", "la-roche-posay"] },
    { name: "Crema Solar SPF50 200ml", brand: "Biotherm", sku: "BB-BIO-001", cost: 20.00, retail: 34.99, category: "solares-corporal", spf: 50, tags: ["solar", "corporal", "spf50", "biotherm"] },
    { name: "Spray Invisible SPF50 200ml", brand: "Garnier Delial", sku: "BB-GAR-001", cost: 6.00, retail: 11.99, category: "solares-corporal", spf: 50, tags: ["solar", "corporal", "spray", "garnier"] },
    { name: "Kids Loción FP50+ 200ml", brand: "Nivea Sun", sku: "BB-NIV-001", cost: 7.00, retail: 13.99, category: "solares-corporal", spf: 50, tags: ["solar", "niños", "spf50", "nivea"] },
    { name: "Crema Iluminadora Vitamina C 50ml", brand: "Byphasse", sku: "BB-BYP-001", cost: 7.00, retail: 14.99, category: "serums", tags: ["vitamina-c", "serum", "iluminadora"] },
    { name: "Bruma Facial Hidratante 59ml", brand: "Mario Badescu", sku: "BB-MB-001", cost: 7.50, retail: 13.99, category: "hidratantes", tags: ["bruma", "hidratante", "facial"] },
    { name: "Aceite Rosa Mosqueta Facial 50ml", brand: "Pranarôm", sku: "BB-PRA-001", cost: 14.00, retail: 24.99, category: "serums", tags: ["rosa-mosqueta", "aceite", "facial", "serum"] },
    { name: "Ampollas Efecto Lifting Cure de Nuit", brand: "Payot", sku: "BB-PAY-001", cost: 29.00, retail: 49.99, category: "serums", tags: ["lifting", "ampollas", "payot"] },
    { name: "Benefiance Wrinkle Smoothing Eye 15ml", brand: "Shiseido", sku: "BB-SHI-001", cost: 48.00, retail: 82.00, category: "contorno-ojos", tags: ["antiaging", "shiseido", "contorno-ojos"] },
    { name: "Crema Limpiadora Exfoliante", brand: "Caudalie", sku: "BB-CAU-001", cost: 19.00, retail: 29.99, category: "limpiadores", tags: ["limpiador", "exfoliante", "caudalie"] },
    { name: "Espuma Limpiadora Revitalizante 120ml", brand: "USU Cosmetics", sku: "BB-USU-001", cost: 11.00, retail: 19.99, category: "limpiadores", tags: ["limpiador", "espuma", "revitalizante"] },
  ];

  for (const p of bigbuyProducts) {
    const slug = slugify(`${p.name}-${p.sku.toLowerCase()}`);
    await db.product.upsert({
      where: { sku: p.sku },
      update: { stock: 50, retailPrice: p.retail },
      create: {
        slug,
        name: p.name,
        nameEs: p.name,
        descriptionEs: `${p.name} de la marca ${p.brand}. Producto premium para el cuidado de la piel con fórmula de alta eficacia. Formulado para resultados visibles desde la primera aplicación.`,
        sku: p.sku,
        supplier: "BIGBUY",
        supplierSku: p.sku.replace("BB-", ""),
        costPrice: p.cost,
        retailPrice: p.retail,
        compareAtPrice: parseFloat((p.retail * 1.15).toFixed(2)),
        stock: 50,
        brand: p.brand,
        spf: p.spf,
        tags: p.tags,
        active: true,
        featured: ["BB-ISDIN-001", "BB-HEL-001", "BB-LRP-001"].includes(p.sku),
        categories: {
          create: { categoryId: categoryMap[p.category] },
        },
        images: {
          create: [{
            url: `https://placehold.co/500x500/F5F0E8/2D5016?text=${encodeURIComponent(p.brand)}`,
            altEs: p.name,
            position: 0,
          }],
        },
      },
    });
  }
  console.log("✅ BigBuy products seeded");

  // DietiSur Products
  const dietisurProducts = [
    { name: "Crema Solar Facial SPF50+ 50ml", brand: "Biosolis", sku: "DS-BIO-001", cost: 10.00, retail: 21.99, category: "eco-mineral", spf: 50, eco: true, vegan: true },
    { name: "Crema Solar Facial Antiedad SPF30 50ml", brand: "Biosolis", sku: "DS-BIO-002", cost: 9.00, retail: 18.99, category: "eco-mineral", spf: 30, eco: true, vegan: true },
    { name: "Crema Solar Bio SPF50 50ml", brand: "Alphanova Sun", sku: "DS-ALP-001", cost: 9.00, retail: 18.99, category: "eco-mineral", spf: 50, eco: true, vegan: true },
    { name: "Aceite Protector SPF20 100ml", brand: "Biosolis", sku: "DS-BIO-003", cost: 8.00, retail: 15.99, category: "eco-mineral", spf: 20, eco: true },
    { name: "Leche After Sun Aloe Vera 150ml", brand: "Biosolis", sku: "DS-BIO-004", cost: 6.00, retail: 12.99, category: "after-sun", eco: true, vegan: true },
    { name: "Crema de Rosa Hidratante 30ml", brand: "Dr. Hauschka", sku: "DS-DRH-001", cost: 18.00, retail: 31.99, category: "hidratantes", eco: true },
    { name: "Sérum Vitamina C Orgánica 30ml", brand: "Florame", sku: "DS-FLO-001", cost: 14.00, retail: 25.99, category: "serums", eco: true, vegan: true },
    { name: "Crema Hidratante Aloe + Centella 50ml", brand: "Cattier", sku: "DS-CAT-001", cost: 9.00, retail: 17.99, category: "hidratantes", eco: true, vegan: true },
    { name: "Sérum Ácido Hialurónico + Colágeno 30ml", brand: "Annemarie Börlind", sku: "DS-ANB-001", cost: 20.00, retail: 34.99, category: "serums", eco: true },
    { name: "Sérum Aceite Argán + Rosa Mosqueta 30ml", brand: "Avril", sku: "DS-AVR-001", cost: 8.00, retail: 15.99, category: "serums", eco: true, vegan: true },
    { name: "Sérum Niacinamida + AH 30ml", brand: "Corpore Sano", sku: "DS-COR-001", cost: 9.00, retail: 16.99, category: "serums", eco: true },
  ];

  for (const p of dietisurProducts) {
    const slug = slugify(`${p.name}-${p.sku.toLowerCase()}`);
    await db.product.upsert({
      where: { sku: p.sku },
      update: { stock: 30, retailPrice: p.retail },
      create: {
        slug,
        name: p.name,
        nameEs: p.name,
        descriptionEs: `${p.name} de ${p.brand}. ${p.eco ? "Cosmética eco-certificada, formulada con ingredientes de origen natural y sostenible. " : ""}${p.spf ? `Factor de protección solar ${p.spf}. ` : ""}Ideal para pieles sensibles y concienciadas con el medio ambiente.`,
        sku: p.sku,
        supplier: "DIETISUR",
        supplierSku: p.sku.replace("DS-", ""),
        costPrice: p.cost,
        retailPrice: p.retail,
        stock: 30,
        brand: p.brand,
        spf: p.spf,
        isEco: p.eco || false,
        isVegan: p.vegan || false,
        isCrueltyFree: p.eco || false,
        tags: ["eco", "natural", p.brand.toLowerCase().replace(/\s/g, "-"), p.eco ? "eco-certified" : ""].filter(Boolean),
        active: true,
        featured: ["DS-BIO-001", "DS-FLO-001"].includes(p.sku),
        categories: {
          create: { categoryId: categoryMap[p.category] },
        },
        images: {
          create: [{
            url: `https://placehold.co/500x500/F0F5E8/2D5016?text=${encodeURIComponent(p.brand)}`,
            altEs: p.name,
            position: 0,
          }],
        },
      },
    });
  }
  console.log("✅ DietiSur products seeded");

  // Bundles
  const bundleData = [
    {
      name: "Rutina Solar Diaria",
      slug: "rutina-solar-diaria",
      description: "El kit perfecto para proteger tu piel cada día: solar facial premium, vitamina C y after sun reparador.",
      discount: 10,
      skus: ["BB-ISDIN-001", "BB-BYP-001", "DS-BIO-004"],
    },
    {
      name: "Kit Eco Solar",
      slug: "kit-eco-solar",
      description: "Protección solar y skincare 100% naturales. La combinación perfecta para pieles sensibles y concienciadas.",
      discount: 10,
      skus: ["DS-BIO-001", "DS-FLO-001", "DS-CAT-001"],
    },
    {
      name: "Protección Familiar",
      slug: "proteccion-familiar",
      description: "Solar eco para adultos y niños. Protege a toda la familia de forma natural y efectiva.",
      discount: 8,
      skus: ["DS-ALP-001", "DS-BIO-001", "DS-BIO-004"],
    },
    {
      name: "Anti-Manchas Pro",
      slug: "anti-manchas-pro",
      description: "Combate las manchas con la mejor protección solar farmacéutica y niacinamida de acción rápida.",
      discount: 8,
      skus: ["BB-LRP-001", "DS-COR-001"],
    },
  ];

  for (const bundle of bundleData) {
    const products = await db.product.findMany({
      where: { sku: { in: bundle.skus } },
      select: { id: true, sku: true, retailPrice: true },
    });

    if (products.length !== bundle.skus.length) {
      console.warn(`⚠ Bundle ${bundle.name}: found ${products.length}/${bundle.skus.length} products`);
      continue;
    }

    const totalPrice = products.reduce((s, p) => s + parseFloat(p.retailPrice.toString()), 0);
    const discountedPrice = totalPrice * (1 - bundle.discount / 100);

    await db.bundle.upsert({
      where: { slug: bundle.slug },
      update: {},
      create: {
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        discount: bundle.discount,
        retailPrice: parseFloat(discountedPrice.toFixed(2)),
        items: {
          create: bundle.skus.map((sku) => ({
            productId: products.find((p) => p.sku === sku)!.id,
            quantity: 1,
          })),
        },
      },
    });
  }
  console.log("✅ Bundles seeded");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
