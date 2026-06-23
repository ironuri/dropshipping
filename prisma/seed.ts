import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    // 1. Línea Solar
    { slug: "linea-solar",         nameEs: "Línea Solar",               name: "Sun Care" },
    { slug: "solar-facial",        nameEs: "Solar Facial",              name: "Facial Sun Care",      parentSlug: "linea-solar" },
    { slug: "solar-corporal",      nameEs: "Solar Corporal",            name: "Body Sun Care",        parentSlug: "linea-solar" },
    { slug: "solar-ninos",         nameEs: "Solar Niños",               name: "Kids Sun Care",        parentSlug: "linea-solar" },
    { slug: "after-sun",           nameEs: "After Sun",                 name: "After Sun",            parentSlug: "linea-solar" },
    { slug: "solar-eco",           nameEs: "Solar Eco & Mineral",       name: "Eco & Mineral Solar",  parentSlug: "linea-solar" },

    // 2. Cosmética
    { slug: "cosmetica",           nameEs: "Cosmética",                 name: "Cosmetics" },
    { slug: "cosmetica-eco",       nameEs: "Cosmética Eco Certificada", name: "Certified Eco Cosmetics", parentSlug: "cosmetica" },
    { slug: "cosmetica-vegana",    nameEs: "Cosmética Vegana",          name: "Vegan Cosmetics",      parentSlug: "cosmetica" },

    // 3. Cuidado Facial
    { slug: "cuidado-facial",        nameEs: "Cuidado Facial",          name: "Facial Care" },
    { slug: "limpiadores",           nameEs: "Limpiadores",             name: "Cleansers",            parentSlug: "cuidado-facial" },
    { slug: "desmaquillantes",       nameEs: "Desmaquillantes",         name: "Makeup Removers",      parentSlug: "cuidado-facial" },
    { slug: "tonicos-esencias",      nameEs: "Tónicos y Esencias",      name: "Toners & Essences",    parentSlug: "cuidado-facial" },
    { slug: "serums-aceites",        nameEs: "Sérums y Aceites",        name: "Serums & Oils",        parentSlug: "cuidado-facial" },
    { slug: "crema-tratamiento",     nameEs: "Crema de Tratamiento",    name: "Treatment Creams",     parentSlug: "cuidado-facial" },
    { slug: "mascarillas",           nameEs: "Mascarillas",             name: "Masks",                parentSlug: "cuidado-facial" },
    { slug: "exfoliantes-faciales",  nameEs: "Exfoliantes",            name: "Facial Exfoliants",    parentSlug: "cuidado-facial" },
    { slug: "contorno-ojos",         nameEs: "Contorno de Ojos",        name: "Eye Contour",          parentSlug: "cuidado-facial" },
    { slug: "balsamo-labial",        nameEs: "Bálsamo Labial",          name: "Lip Balm",             parentSlug: "cuidado-facial" },
    { slug: "tratamientos-faciales", nameEs: "Tratamientos Específicos",name: "Specific Treatments",  parentSlug: "cuidado-facial" },
    { slug: "eco-recargas",          nameEs: "Eco-Recargas",            name: "Eco Refills",          parentSlug: "cuidado-facial" },
    { slug: "maquillaje",            nameEs: "Maquillaje",              name: "Makeup",               parentSlug: "cuidado-facial" },

    // 4. Cuidado Corporal
    { slug: "cuidado-corporal",      nameEs: "Cuidado Corporal",        name: "Body Care" },
    { slug: "exfoliante-corporal",   nameEs: "Exfoliante Corporal",     name: "Body Exfoliants",      parentSlug: "cuidado-corporal" },
    { slug: "crema-hidratante-corp", nameEs: "Crema Hidratante",        name: "Body Moisturizers",    parentSlug: "cuidado-corporal" },
    { slug: "aceite-corporal",       nameEs: "Aceite Corporal",         name: "Body Oils",            parentSlug: "cuidado-corporal" },
    { slug: "crema-manos-unas",      nameEs: "Crema de Manos y Uñas",   name: "Hand & Nail Cream",    parentSlug: "cuidado-corporal" },
    { slug: "tratamientos-corp",     nameEs: "Tratamientos Específicos",name: "Body Treatments",      parentSlug: "cuidado-corporal" },
    { slug: "cuidado-intimo",        nameEs: "Cuidado Íntimo",          name: "Intimate Care",        parentSlug: "cuidado-corporal" },
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

  // ─── Demo Products (BTSWholesaler) ──────────────────────────────────────────
  // Placeholder products for development — real catalog comes from API sync
  const products = [
    // Línea Solar — Facial
    { name: "Fotoprotector Fusion Water SPF50 50ml",         brand: "ISDIN",           sku: "BTS-ISDIN-001", cost: 11.00, retail: 19.99, cat: "solar-facial",         spf: 50,  eco: false, vegan: false, featured: true  },
    { name: "Heliocare 360° Gel Oil-Free SPF50+ 50ml",       brand: "Heliocare",       sku: "BTS-HEL-001",   cost: 14.00, retail: 25.99, cat: "solar-facial",         spf: 50,  eco: false, vegan: false, featured: true  },
    { name: "Anthelios UV-MUNE 400 SPF50+ 50ml",             brand: "La Roche-Posay",  sku: "BTS-LRP-001",   cost: 16.00, retail: 28.99, cat: "solar-facial",         spf: 50,  eco: false, vegan: false, featured: true  },
    // Línea Solar — Corporal
    { name: "Crema Solar SPF50 200ml",                       brand: "Biotherm",        sku: "BTS-BIO-001",   cost: 20.00, retail: 34.99, cat: "solar-corporal",       spf: 50,  eco: false, vegan: false, featured: false },
    { name: "Spray Invisible SPF50 200ml",                   brand: "Garnier",         sku: "BTS-GAR-001",   cost: 6.00,  retail: 11.99, cat: "solar-corporal",       spf: 50,  eco: false, vegan: false, featured: false },
    // Línea Solar — Niños
    { name: "Kids Loción FP50+ 200ml",                       brand: "Nivea Sun",       sku: "BTS-NIV-001",   cost: 7.00,  retail: 13.99, cat: "solar-ninos",          spf: 50,  eco: false, vegan: false, featured: false },
    // Solar Eco
    { name: "Crema Solar Facial SPF50+ Bio 50ml",            brand: "Biosolis",        sku: "BTS-BIOS-001",  cost: 10.00, retail: 21.99, cat: "solar-eco",            spf: 50,  eco: true,  vegan: true,  featured: true  },
    { name: "Crema Solar Bio SPF50 50ml",                    brand: "Alphanova Sun",   sku: "BTS-ALP-001",   cost: 9.00,  retail: 18.99, cat: "solar-eco",            spf: 50,  eco: true,  vegan: true,  featured: false },
    // After Sun
    { name: "Leche After Sun Aloe Vera 150ml",               brand: "Biosolis",        sku: "BTS-BIOS-002",  cost: 6.00,  retail: 12.99, cat: "after-sun",            spf: null, eco: true, vegan: true,  featured: false },
    // Cuidado Facial — Limpiadores
    { name: "Gel Limpiador Espumoso Foaming Cleanser 473ml", brand: "CeraVe",          sku: "BTS-CVE-001",   cost: 8.50,  retail: 15.99, cat: "limpiadores",          spf: null, eco: false, vegan: false, featured: false },
    { name: "Gel Limpiador Facial Sebiaclear 200ml",         brand: "SVR",             sku: "BTS-SVR-001",   cost: 7.00,  retail: 13.99, cat: "limpiadores",          spf: null, eco: false, vegan: false, featured: false },
    // Cuidado Facial — Sérums y Aceites
    { name: "Crema Iluminadora Vitamina C 50ml",             brand: "Byphasse",        sku: "BTS-BYP-001",   cost: 7.00,  retail: 14.99, cat: "serums-aceites",       spf: null, eco: false, vegan: false, featured: false },
    { name: "Sérum Vitamina C Orgánica 30ml",                brand: "Florame",         sku: "BTS-FLO-001",   cost: 14.00, retail: 25.99, cat: "serums-aceites",       spf: null, eco: true,  vegan: true,  featured: true  },
    { name: "Aceite Rosa Mosqueta Facial 50ml",              brand: "Pranarôm",        sku: "BTS-PRA-001",   cost: 14.00, retail: 24.99, cat: "serums-aceites",       spf: null, eco: true,  vegan: true,  featured: false },
    // Cuidado Facial — Crema de Tratamiento
    { name: "Crema Antiarrugas Advanced Ceramide Noche 50ml",brand: "Elizabeth Arden", sku: "BTS-EAR-001",   cost: 28.00, retail: 48.99, cat: "crema-tratamiento",    spf: null, eco: false, vegan: false, featured: false },
    { name: "Crema Hidratante Aloe + Centella 50ml",         brand: "Cattier",         sku: "BTS-CAT-001",   cost: 9.00,  retail: 17.99, cat: "crema-tratamiento",    spf: null, eco: true,  vegan: true,  featured: false },
    // Cuidado Facial — Contorno de Ojos
    { name: "Benefiance Wrinkle Smoothing Eye Cream 15ml",   brand: "Shiseido",        sku: "BTS-SHI-001",   cost: 48.00, retail: 82.00, cat: "contorno-ojos",        spf: null, eco: false, vegan: false, featured: false },
    // Cuidado Corporal
    { name: "Body Love Moisturising Body Cream 250ml",       brand: "Dove",            sku: "BTS-DOV-001",   cost: 4.50,  retail: 8.99,  cat: "crema-hidratante-corp", spf: null, eco: false, vegan: false, featured: false },
    { name: "Crema Corporal Hidratante 350ml",               brand: "Eucerin",         sku: "BTS-EUC-001",   cost: 9.00,  retail: 16.99, cat: "crema-hidratante-corp", spf: null, eco: false, vegan: false, featured: false },
    // Maquillaje
    { name: "Eau de Parfum Chance 50ml",                     brand: "Chanel",          sku: "BTS-CHA-001",   cost: 65.00, retail: 109.99,cat: "maquillaje",           spf: null, eco: false, vegan: false, featured: false },
  ];

  for (const p of products) {
    const slug = slugify(`${p.name}-${p.sku.toLowerCase()}`);
    await db.product.upsert({
      where: { sku: p.sku },
      update: { stock: 50, retailPrice: p.retail },
      create: {
        slug,
        name: p.name,
        nameEs: p.name,
        descriptionEs: `${p.name} de la marca ${p.brand}. Producto premium para el cuidado de la piel con fórmula de alta eficacia.${p.spf ? ` Factor de protección solar ${p.spf}.` : ""}`,
        sku: p.sku,
        supplier: "BTSWHOLESALER",
        supplierSku: p.sku.replace("BTS-", ""),
        costPrice: p.cost,
        retailPrice: p.retail,
        compareAtPrice: parseFloat((p.retail * 1.15).toFixed(2)),
        stock: 50,
        brand: p.brand,
        spf: p.spf ?? undefined,
        isEco: p.eco,
        isVegan: p.vegan,
        isCrueltyFree: p.eco,
        tags: [p.brand.toLowerCase().replace(/[\s.]/g, "-"), p.eco ? "eco" : "", p.vegan ? "vegano" : ""].filter(Boolean),
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
  console.log("✅ Demo products seeded (BTSWholesaler)");

  // ─── Bundles ────────────────────────────────────────────────────────────────
  const bundleData = [
    {
      name: "Rutina Solar Diaria",
      slug: "rutina-solar-diaria",
      description: "Kit perfecto para proteger tu piel cada día: solar facial premium, vitamina C y after sun reparador.",
      discount: 10,
      skus: ["BTS-ISDIN-001", "BTS-BYP-001", "BTS-BIOS-002"],
    },
    {
      name: "Kit Eco Solar",
      slug: "kit-eco-solar",
      description: "Protección solar y skincare 100% naturales. La combinación perfecta para pieles sensibles.",
      discount: 10,
      skus: ["BTS-BIOS-001", "BTS-FLO-001", "BTS-CAT-001"],
    },
    {
      name: "Rutina Facial Completa",
      slug: "rutina-facial-completa",
      description: "Limpieza, sérum vitamina C y protección solar en un solo kit. La rutina matinal perfecta.",
      discount: 12,
      skus: ["BTS-CVE-001", "BTS-BYP-001", "BTS-ISDIN-001"],
    },
  ];

  for (const bundle of bundleData) {
    const prods = await db.product.findMany({
      where: { sku: { in: bundle.skus } },
      select: { id: true, sku: true, retailPrice: true },
    });

    if (prods.length !== bundle.skus.length) {
      console.warn(`⚠ Bundle "${bundle.name}": found ${prods.length}/${bundle.skus.length} products`);
      continue;
    }

    const totalPrice = prods.reduce((s, p) => s + parseFloat(p.retailPrice.toString()), 0);

    await db.bundle.upsert({
      where: { slug: bundle.slug },
      update: {},
      create: {
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        discount: bundle.discount,
        retailPrice: parseFloat((totalPrice * (1 - bundle.discount / 100)).toFixed(2)),
        items: {
          create: bundle.skus.map((sku) => ({
            productId: prods.find((p) => p.sku === sku)!.id,
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
