import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    // 1. Línea Solar
    { slug: "linea-solar", nameEs: "Línea Solar", name: "Sun Care" },
    { slug: "solar-facial",    nameEs: "Solar Facial",        name: "Facial Sun Care",    parentSlug: "linea-solar" },
    { slug: "solar-corporal",  nameEs: "Solar Corporal",      name: "Body Sun Care",      parentSlug: "linea-solar" },
    { slug: "solar-ninos",     nameEs: "Solar Niños",         name: "Kids Sun Care",      parentSlug: "linea-solar" },
    { slug: "after-sun",       nameEs: "After Sun",           name: "After Sun",          parentSlug: "linea-solar" },
    { slug: "solar-eco",       nameEs: "Solar Eco & Mineral", name: "Eco & Mineral Solar",parentSlug: "linea-solar" },

    // 2. Cosmética
    { slug: "cosmetica",       nameEs: "Cosmética",           name: "Cosmetics" },
    { slug: "cosmetica-eco",   nameEs: "Cosmética Eco Certificada", name: "Certified Eco Cosmetics", parentSlug: "cosmetica" },
    { slug: "cosmetica-vegana",nameEs: "Cosmética Vegana",    name: "Vegan Cosmetics",    parentSlug: "cosmetica" },

    // 3. Cuidado Facial (based on Germaine de Capuccini structure)
    { slug: "cuidado-facial",        nameEs: "Cuidado Facial",        name: "Facial Care" },
    { slug: "limpiadores",           nameEs: "Limpiadores",           name: "Cleansers",          parentSlug: "cuidado-facial" },
    { slug: "desmaquillantes",       nameEs: "Desmaquillantes",       name: "Makeup Removers",    parentSlug: "cuidado-facial" },
    { slug: "tonicos-esencias",      nameEs: "Tónicos y Esencias",    name: "Toners & Essences",  parentSlug: "cuidado-facial" },
    { slug: "serums-aceites",        nameEs: "Sérums y Aceites",      name: "Serums & Oils",      parentSlug: "cuidado-facial" },
    { slug: "crema-tratamiento",     nameEs: "Crema de Tratamiento",  name: "Treatment Creams",   parentSlug: "cuidado-facial" },
    { slug: "mascarillas",           nameEs: "Mascarillas",           name: "Masks",              parentSlug: "cuidado-facial" },
    { slug: "exfoliantes-faciales",  nameEs: "Exfoliantes",          name: "Facial Exfoliants",  parentSlug: "cuidado-facial" },
    { slug: "contorno-ojos",         nameEs: "Contorno de Ojos",      name: "Eye Contour",        parentSlug: "cuidado-facial" },
    { slug: "balsamo-labial",        nameEs: "Bálsamo Labial",        name: "Lip Balm",           parentSlug: "cuidado-facial" },
    { slug: "tratamientos-faciales", nameEs: "Tratamientos Específicos", name: "Specific Treatments", parentSlug: "cuidado-facial" },
    { slug: "eco-recargas",          nameEs: "Eco-Recargas",          name: "Eco Refills",        parentSlug: "cuidado-facial" },
    { slug: "maquillaje",            nameEs: "Maquillaje",            name: "Makeup",             parentSlug: "cuidado-facial" },

    // 4. Cuidado Corporal (based on Germaine de Capuccini structure)
    { slug: "cuidado-corporal",      nameEs: "Cuidado Corporal",      name: "Body Care" },
    { slug: "exfoliante-corporal",   nameEs: "Exfoliante Corporal",   name: "Body Exfoliants",   parentSlug: "cuidado-corporal" },
    { slug: "crema-hidratante-corp", nameEs: "Crema Hidratante",      name: "Body Moisturizers", parentSlug: "cuidado-corporal" },
    { slug: "aceite-corporal",       nameEs: "Aceite Corporal",       name: "Body Oils",         parentSlug: "cuidado-corporal" },
    { slug: "crema-manos-unas",      nameEs: "Crema de Manos y Uñas", name: "Hand & Nail Cream", parentSlug: "cuidado-corporal" },
    { slug: "tratamientos-corp",     nameEs: "Tratamientos Específicos", name: "Body Treatments",parentSlug: "cuidado-corporal" },
    { slug: "cuidado-intimo",        nameEs: "Cuidado Íntimo",        name: "Intimate Care",     parentSlug: "cuidado-corporal" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: { nameEs: cat.nameEs },
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

  // ─── BigBuy Products ─────────────────────────────────────────────────────────
  // Confirmed available at bigbuy.eu (via web research June 2026)
  const bigbuyProducts = [
    // Línea Solar — Facial
    { name: "Fotoprotector Fusion Water SPF50 50ml",        brand: "ISDIN",          sku: "BB-ISDIN-001", cost: 11.00, retail: 19.99, cat: "solar-facial",        spf: 50,  featured: true,  tags: ["solar", "facial", "spf50", "isdin", "ligera"] },
    { name: "Heliocare 360° Gel Oil-Free SPF50+ 50ml",      brand: "Heliocare",      sku: "BB-HEL-001",  cost: 14.00, retail: 25.99, cat: "solar-facial",        spf: 50,  featured: true,  tags: ["solar", "facial", "spf50", "heliocare", "oil-free"] },
    { name: "Anthelios UV-MUNE 400 SPF50+ 50ml",            brand: "La Roche-Posay", sku: "BB-LRP-001",  cost: 16.00, retail: 28.99, cat: "solar-facial",        spf: 50,  featured: true,  tags: ["solar", "facial", "spf50", "la-roche-posay"] },
    // Línea Solar — Corporal
    { name: "Crema Solar SPF50 200ml",                      brand: "Biotherm",       sku: "BB-BIO-001",  cost: 20.00, retail: 34.99, cat: "solar-corporal",      spf: 50,  featured: false, tags: ["solar", "corporal", "spf50", "biotherm"] },
    { name: "Spray Invisible SPF50 200ml",                  brand: "Garnier Delial", sku: "BB-GAR-001",  cost: 6.00,  retail: 11.99, cat: "solar-corporal",      spf: 50,  featured: false, tags: ["solar", "corporal", "spray", "garnier"] },
    // Línea Solar — Niños
    { name: "Kids Loción FP50+ 200ml",                      brand: "Nivea Sun",      sku: "BB-NIV-001",  cost: 7.00,  retail: 13.99, cat: "solar-ninos",         spf: 50,  featured: false, tags: ["solar", "niños", "spf50", "nivea", "kids"] },
    // Cuidado Facial — Limpiadores (confirmed on bigbuy.eu)
    { name: "Gel Limpiador Espumoso Foaming Cleanser 473ml",brand: "CeraVe",         sku: "BB-CVE-001",  cost: 8.50,  retail: 15.99, cat: "limpiadores",         spf: null, featured: false, tags: ["limpiador", "espuma", "cerave", "piel-sensible"] },
    { name: "Gel Limpiador Facial Sebiaclear 200ml",        brand: "SVR",            sku: "BB-SVR-001",  cost: 7.00,  retail: 13.99, cat: "limpiadores",         spf: null, featured: false, tags: ["limpiador", "gel", "svr", "piel-grasa", "sebiaclear"] },
    { name: "Espuma Limpiadora Peptide Collagen 150ml",     brand: "It's Skin",      sku: "BB-ITS-001",  cost: 6.00,  retail: 11.99, cat: "limpiadores",         spf: null, featured: false, tags: ["limpiador", "espuma", "peptide", "colageno"] },
    { name: "Crema Limpiadora Exfoliante 75ml",             brand: "Caudalie",       sku: "BB-CAU-001",  cost: 19.00, retail: 29.99, cat: "limpiadores",         spf: null, featured: false, tags: ["limpiador", "exfoliante", "caudalie"] },
    { name: "Espuma Limpiadora Revitalizante 120ml",        brand: "USU Cosmetics",  sku: "BB-USU-001",  cost: 11.00, retail: 19.99, cat: "limpiadores",         spf: null, featured: false, tags: ["limpiador", "espuma", "revitalizante"] },
    // Cuidado Facial — Sérums y Aceites
    { name: "Crema Iluminadora Vitamina C 50ml",            brand: "Byphasse",       sku: "BB-BYP-001",  cost: 7.00,  retail: 14.99, cat: "serums-aceites",      spf: null, featured: false, tags: ["vitamina-c", "serum", "iluminadora"] },
    { name: "Aceite Rosa Mosqueta Facial 50ml",             brand: "Pranarôm",       sku: "BB-PRA-001",  cost: 14.00, retail: 24.99, cat: "serums-aceites",      spf: null, featured: false, tags: ["rosa-mosqueta", "aceite", "facial", "serum"] },
    { name: "Ampollas Efecto Lifting Cure de Nuit",         brand: "Payot",          sku: "BB-PAY-001",  cost: 29.00, retail: 49.99, cat: "tratamientos-faciales",spf: null,featured: false, tags: ["lifting", "ampollas", "payot"] },
    // Cuidado Facial — Crema de Tratamiento
    { name: "Bruma Facial Hidratante Rose Water 59ml",      brand: "Mario Badescu",  sku: "BB-MB-001",   cost: 7.50,  retail: 13.99, cat: "crema-tratamiento",   spf: null, featured: false, tags: ["bruma", "hidratante", "facial", "rosa"] },
    { name: "Crema Antiarrugas Advanced Ceramide Noche 50ml",brand:"Elizabeth Arden",sku: "BB-EAR-001",  cost: 28.00, retail: 48.99, cat: "crema-tratamiento",   spf: null, featured: false, tags: ["antiarrugas", "noche", "ceramide", "antiaging"] },
    // Cuidado Facial — Contorno de Ojos
    { name: "Benefiance Wrinkle Smoothing Eye Cream 15ml",  brand: "Shiseido",       sku: "BB-SHI-001",  cost: 48.00, retail: 82.00, cat: "contorno-ojos",       spf: null, featured: false, tags: ["antiaging", "shiseido", "contorno-ojos", "arrugas"] },
    { name: "Eye Cream Antiedad 10ml",                      brand: "Alma Secret",    sku: "BB-ALS-001",  cost: 9.00,  retail: 16.99, cat: "contorno-ojos",       spf: null, featured: false, tags: ["contorno-ojos", "antiedad", "alma-secret"] },
    // Cuidado Corporal — Crema Hidratante (confirmed on bigbuy.eu)
    { name: "Body Love Moisturising Body Cream 250ml",      brand: "Dove",           sku: "BB-DOV-001",  cost: 4.50,  retail: 8.99,  cat: "crema-hidratante-corp",spf: null,featured: false, tags: ["corporal", "hidratante", "dove", "body"] },
    { name: "Crema Corporal Hidratante 350ml",              brand: "Eucerin",        sku: "BB-EUC-001",  cost: 9.00,  retail: 16.99, cat: "crema-hidratante-corp",spf: null,featured: false, tags: ["corporal", "hidratante", "eucerin", "piel-seca"] },
    { name: "Crema Corporal Hidratante Aceite de Coco 500ml",brand:"Byphasse",       sku: "BB-BYP-002",  cost: 6.50,  retail: 12.99, cat: "crema-hidratante-corp",spf: null,featured: false, tags: ["corporal", "hidratante", "coco", "byphasse"] },
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
        spf: p.spf ?? undefined,
        tags: p.tags,
        active: true,
        featured: p.featured,
        categories: { create: { categoryId: categoryMap[p.cat] } },
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

  // ─── DietiSur Products (eco/natural) ────────────────────────────────────────
  const dietisurProducts = [
    // Línea Solar Eco
    { name: "Crema Solar Facial SPF50+ 50ml",             brand: "Biosolis",            sku: "DS-BIO-001", cost: 10.00, retail: 21.99, cat: "solar-eco",       spf: 50,  eco: true,  vegan: true,  featured: true  },
    { name: "Crema Solar Facial Antiedad SPF30 50ml",     brand: "Biosolis",            sku: "DS-BIO-002", cost: 9.00,  retail: 18.99, cat: "solar-eco",       spf: 30,  eco: true,  vegan: true,  featured: false },
    { name: "Crema Solar Bio SPF50 50ml",                 brand: "Alphanova Sun",       sku: "DS-ALP-001", cost: 9.00,  retail: 18.99, cat: "solar-eco",       spf: 50,  eco: true,  vegan: true,  featured: false },
    { name: "Aceite Protector SPF20 100ml",               brand: "Biosolis",            sku: "DS-BIO-003", cost: 8.00,  retail: 15.99, cat: "solar-eco",       spf: 20,  eco: true,  vegan: false, featured: false },
    // After Sun
    { name: "Leche After Sun Aloe Vera 150ml",            brand: "Biosolis",            sku: "DS-BIO-004", cost: 6.00,  retail: 12.99, cat: "after-sun",       spf: null,eco: true,  vegan: true,  featured: false },
    // Cosmética Eco — Sérums y Aceites
    { name: "Sérum Vitamina C Orgánica 30ml",             brand: "Florame",             sku: "DS-FLO-001", cost: 14.00, retail: 25.99, cat: "serums-aceites",  spf: null,eco: true,  vegan: true,  featured: true  },
    { name: "Sérum Ácido Hialurónico + Colágeno 30ml",   brand: "Annemarie Börlind",   sku: "DS-ANB-001", cost: 20.00, retail: 34.99, cat: "serums-aceites",  spf: null,eco: true,  vegan: false, featured: false },
    { name: "Sérum Aceite Argán + Rosa Mosqueta 30ml",   brand: "Avril",               sku: "DS-AVR-001", cost: 8.00,  retail: 15.99, cat: "serums-aceites",  spf: null,eco: true,  vegan: true,  featured: false },
    { name: "Sérum Niacinamida + AH 30ml",               brand: "Corpore Sano",        sku: "DS-COR-001", cost: 9.00,  retail: 16.99, cat: "serums-aceites",  spf: null,eco: true,  vegan: false, featured: false },
    // Cosmética Eco — Crema de Tratamiento
    { name: "Crema de Rosa Hidratante 30ml",             brand: "Dr. Hauschka",        sku: "DS-DRH-001", cost: 18.00, retail: 31.99, cat: "crema-tratamiento",spf: null,eco: true,  vegan: false, featured: false },
    { name: "Crema Hidratante Aloe + Centella 50ml",     brand: "Cattier",             sku: "DS-CAT-001", cost: 9.00,  retail: 17.99, cat: "crema-tratamiento",spf: null,eco: true,  vegan: true,  featured: false },
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
        descriptionEs: `${p.name} de ${p.brand}. Cosmética eco-certificada, formulada con ingredientes de origen natural y sostenible.${p.spf ? ` Factor de protección solar ${p.spf}.` : ""} Ideal para pieles sensibles y concienciadas con el medio ambiente.`,
        sku: p.sku,
        supplier: "DIETISUR",
        supplierSku: p.sku.replace("DS-", ""),
        costPrice: p.cost,
        retailPrice: p.retail,
        stock: 30,
        brand: p.brand,
        spf: p.spf ?? undefined,
        isEco: p.eco,
        isVegan: p.vegan,
        isCrueltyFree: p.eco,
        tags: ["eco", "natural", p.brand.toLowerCase().replace(/[\s.]/g, "-")],
        active: true,
        featured: p.featured,
        categories: { create: { categoryId: categoryMap[p.cat] } },
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

  // ─── Bundles ────────────────────────────────────────────────────────────────
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
      name: "Rutina Facial Completa",
      slug: "rutina-facial-completa",
      description: "Limpieza, sérum vitamina C y protección solar en un solo kit. La rutina matinal perfecta.",
      discount: 12,
      skus: ["BB-CVE-001", "BB-BYP-001", "BB-ISDIN-001"],
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
