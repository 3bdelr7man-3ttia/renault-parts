import { db, packagesTable, partsTable, packagePartsTable, workshopsTable } from "@workspace/db";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed packages
  const packages = [
    {
      name: "باكدج 20,000 كم",
      slug: "pkg-20k",
      description: "صيانة عادية مناسبة لكل 20,000 كيلومتر أو سنة. تشمل تغيير زيت المحرك وفلاتر الهواء والزيت.",
      kmService: 20000,
      basePrice: "800",
      sellPrice: "1040",
      warrantyMonths: 3,
    },
    {
      name: "باكدج 40,000 كم",
      slug: "pkg-40k",
      description: "صيانة متوسطة شاملة لكل 40,000 كيلومتر. تضيف فلتر البنزين وشمعات الإشعال.",
      kmService: 40000,
      basePrice: "1500",
      sellPrice: "1950",
      warrantyMonths: 6,
    },
    {
      name: "باكدج 60,000 كم",
      slug: "pkg-60k",
      description: "صيانة شاملة لكل 60,000 كيلومتر. تشمل سير الكاتينة وفلتر المكيف وزيت الفرامل.",
      kmService: 60000,
      basePrice: "2900",
      sellPrice: "3750",
      warrantyMonths: 9,
    },
    {
      name: "باكدج 100,000 كم",
      slug: "pkg-100k",
      description: "صيانة كبرى لكل 100,000 كيلومتر. تشمل ديسكات الفرامل والتيل والمساعدين.",
      kmService: 100000,
      basePrice: "5800",
      sellPrice: "7500",
      warrantyMonths: 12,
    },
    {
      name: "باكدج الطوارئ",
      slug: "emergency",
      description: "للأعطال الطارئة والاستعداد للرحلات. يشمل بطارية جديدة وإطار احتياطي وكشافات.",
      kmService: 0,
      basePrice: "2500",
      sellPrice: "3250",
      warrantyMonths: 6,
    },
  ];

  const insertedPackages = await db
    .insert(packagesTable)
    .values(packages)
    .onConflictDoNothing()
    .returning();

  console.log(`✅ Inserted ${insertedPackages.length} packages`);

  // Seed parts
  const parts = [
    { name: "فلتر زيت", oemCode: "8200768913", type: "filter", priceOriginal: "150", priceTurkish: "85", priceChinese: "60", compatibleModels: "Renault Logan,Duster,Symbol", supplier: "مصطفى أوتوشوب" },
    { name: "فلتر هواء", oemCode: "8200228186", type: "filter", priceOriginal: "180", priceTurkish: "100", priceChinese: "70", compatibleModels: "Renault Logan,Duster,Symbol", supplier: "مصطفى أوتوشوب" },
    { name: "زيت محرك 5W30 (4 لتر)", oemCode: null, type: "oil", priceOriginal: "350", priceTurkish: null, priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب" },
    { name: "فلتر بنزين", oemCode: "7701478544", type: "filter", priceOriginal: "200", priceTurkish: "120", priceChinese: "85", compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب" },
    { name: "شمعات إشعال (4 حبة)", oemCode: "7700500168", type: "spark_plugs", priceOriginal: "400", priceTurkish: "240", priceChinese: "160", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب" },
    { name: "سير كاتينة", oemCode: "130C17384R", type: "belt", priceOriginal: "600", priceTurkish: "380", priceChinese: "260", compatibleModels: "Renault Logan,Symbol,Duster", supplier: "مصطفى أوتوشوب" },
    { name: "فلتر مكيف", oemCode: "272774EA0A", type: "filter", priceOriginal: "250", priceTurkish: "140", priceChinese: "90", compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب" },
    { name: "زيت فرامل DOT4", oemCode: null, type: "oil", priceOriginal: "180", priceTurkish: null, priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب" },
    { name: "ديسكات فرامل (أمامي)", oemCode: "7701206946", type: "brake", priceOriginal: "1200", priceTurkish: "750", priceChinese: "520", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب" },
    { name: "تيل فرامل (طقم)", oemCode: "7701207173", type: "brake", priceOriginal: "600", priceTurkish: "380", priceChinese: "270", compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب" },
    { name: "مساعدين أماميين", oemCode: "8200860019", type: "suspension", priceOriginal: "1800", priceTurkish: "1200", priceChinese: "850", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب" },
    { name: "بطارية 55 أمبير", oemCode: null, type: "battery", priceOriginal: "1500", priceTurkish: "1100", priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب" },
    { name: "إطار احتياطي 185/65R15", oemCode: null, type: "tire", priceOriginal: "1200", priceTurkish: null, priceChinese: null, compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب" },
    { name: "كشافات LED أمامية (زوج)", oemCode: "7701057800", type: "lights", priceOriginal: "800", priceTurkish: "500", priceChinese: "350", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب" },
  ];

  const insertedParts = await db
    .insert(partsTable)
    .values(parts.map(p => ({
      ...p,
      priceOriginal: p.priceOriginal || null,
      priceTurkish: p.priceTurkish || null,
      priceChinese: p.priceChinese || null,
    })))
    .onConflictDoNothing()
    .returning();

  console.log(`✅ Inserted ${insertedParts.length} parts`);

  // Map parts to packages
  const allPackages = await db.select().from(packagesTable);
  const allParts = await db.select().from(partsTable);

  const findPkg = (slug: string) => allPackages.find(p => p.slug === slug);
  const findPart = (name: string) => allParts.find(p => p.name === name);

  const packagePartsMap = [
    // pkg-20k: فلتر زيت + فلتر هواء + زيت محرك
    { pkgSlug: "pkg-20k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)"] },
    // pkg-40k: all from 20k + فلتر بنزين + شمعات إشعال
    { pkgSlug: "pkg-40k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)"] },
    // pkg-60k: all from 40k + سير كاتينة + فلتر مكيف + زيت فرامل
    { pkgSlug: "pkg-60k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)", "سير كاتينة", "فلتر مكيف", "زيت فرامل DOT4"] },
    // pkg-100k: all from 60k + ديسكات + تيل + مساعدين
    { pkgSlug: "pkg-100k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)", "سير كاتينة", "فلتر مكيف", "زيت فرامل DOT4", "ديسكات فرامل (أمامي)", "تيل فرامل (طقم)", "مساعدين أماميين"] },
    // emergency
    { pkgSlug: "emergency", partNames: ["بطارية 55 أمبير", "إطار احتياطي 185/65R15", "كشافات LED أمامية (زوج)"] },
  ];

  for (const { pkgSlug, partNames } of packagePartsMap) {
    const pkg = findPkg(pkgSlug);
    if (!pkg) continue;
    for (const partName of partNames) {
      const part = findPart(partName);
      if (!part) continue;
      await db
        .insert(packagePartsTable)
        .values({ packageId: pkg.id, partId: part.id })
        .onConflictDoNothing();
    }
  }

  console.log("✅ Linked parts to packages");

  // Seed workshops
  const workshops = [
    { name: "مركز ثمانية سلندر", area: "سيدي بشر", address: "شارع خالد ابن الوليد، سيدي بشر، الإسكندرية", phone: "01000000001", lat: "31.2600", lng: "30.0200", rating: "4.8", partnershipStatus: "active" },
    { name: "ورشة الإسكندرية للصيانة", area: "سموحة", address: "ش التحرير، سموحة، الإسكندرية", phone: "01000000002", lat: "31.2100", lng: "29.9500", rating: "4.5", partnershipStatus: "active" },
    { name: "مركز رينو المنتزه", area: "المنتزه", address: "ش أبو قير، المنتزه، الإسكندرية", phone: "01000000003", lat: "31.2900", lng: "30.0500", rating: "4.6", partnershipStatus: "active" },
    { name: "ورشة كليوباترا", area: "كليوباترا", address: "ش بور سعيد، كليوباترا، الإسكندرية", phone: "01000000004", lat: "31.2450", lng: "29.9800", rating: "4.4", partnershipStatus: "active" },
    { name: "مركز العجمي للخدمة", area: "العجمي", address: "ش الجيش، العجمي، الإسكندرية", phone: "01000000005", lat: "31.1700", lng: "29.8100", rating: "4.3", partnershipStatus: "active" },
    { name: "ورشة محطة الرمل", area: "محطة الرمل", address: "ش النبي دانيال، محطة الرمل، الإسكندرية", phone: "01000000006", lat: "31.2000", lng: "29.9100", rating: "4.7", partnershipStatus: "active" },
  ];

  const insertedWorkshops = await db
    .insert(workshopsTable)
    .values(workshops)
    .onConflictDoNothing()
    .returning();

  console.log(`✅ Inserted ${insertedWorkshops.length} workshops`);

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
