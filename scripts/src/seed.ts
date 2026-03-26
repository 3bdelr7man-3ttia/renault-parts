import {
  appointmentsTable,
  db,
  employeeDailyReportsTable,
  employeeTasksTable,
  expensesTable,
  leadsTable,
  ordersTable,
  packagePartsTable,
  packagesTable,
  partsTable,
  reviewsTable,
  usersTable,
  workshopApplicationsTable,
  workshopPricingTable,
  workshopsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { and, eq, or } from "drizzle-orm";

type SeedPackage = {
  name: string;
  slug: string;
  description: string;
  kmService: number;
  basePrice: string;
  sellPrice: string;
  warrantyMonths: number;
};

type SeedPart = {
  name: string;
  oemCode: string | null;
  type: string;
  priceOriginal: string | null;
  priceTurkish: string | null;
  priceChinese: string | null;
  compatibleModels: string;
  supplier: string;
  stockQty?: number;
};

type SeedWorkshop = {
  name: string;
  area: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  rating: string;
  partnershipStatus: string;
};

type SeedUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  area: string;
  workshopId?: number | null;
  employeeRole?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  address?: string | null;
};

type SeedLead = {
  type: "customer" | "workshop";
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area: string;
  address?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  source: string;
  status: string;
  assignedEmployeeId?: number | null;
  createdByUserId: number;
  lastContactAt?: Date | null;
  nextFollowUpAt?: Date | null;
  notes?: string | null;
  convertedOrderId?: number | null;
  convertedWorkshopId?: number | null;
  registeredUserId?: number | null;
};

type SeedEmployeeTask = {
  employeeId: number;
  leadId?: number | null;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: Date;
  status: string;
  result?: string | null;
  notes?: string | null;
  createdByUserId: number;
};

type SeedEmployeeDailyReport = {
  employeeId: number;
  reportDate: string;
  summary: string;
  achievements?: string | null;
  blockers?: string | null;
  nextSteps?: string | null;
};

const seedPackages: SeedPackage[] = [
  {
    name: "باكدج 20,000 كم",
    slug: "pkg-20k",
    description: "صيانة دورية خفيفة تشمل زيت المحرك وفلتر الزيت وفلتر الهواء وتناسب الاستخدام اليومي داخل الإسكندرية.",
    kmService: 20000,
    basePrice: "1280",
    sellPrice: "1040",
    warrantyMonths: 3,
  },
  {
    name: "باكدج 40,000 كم",
    slug: "pkg-40k",
    description: "صيانة متوسطة تضيف فلتر البنزين وشمعات الإشعال لتحافظ على سلاسة المحرك واستهلاك الوقود.",
    kmService: 40000,
    basePrice: "2400",
    sellPrice: "1950",
    warrantyMonths: 6,
  },
  {
    name: "باكدج 60,000 كم",
    slug: "pkg-60k",
    description: "صيانة شاملة تشمل سير الكاتينة وفلتر المكيف وزيت الفرامل مع مراجعة كاملة قبل التسليم.",
    kmService: 60000,
    basePrice: "4600",
    sellPrice: "3750",
    warrantyMonths: 9,
  },
  {
    name: "باكدج 100,000 كم",
    slug: "pkg-100k",
    description: "صيانة كبرى لسيارات رينو تشمل منظومة الفرامل والمساعدين مع مراجعة أعطال إضافية محتملة.",
    kmService: 100000,
    basePrice: "9200",
    sellPrice: "7500",
    warrantyMonths: 12,
  },
  {
    name: "باكدج الطوارئ",
    slug: "emergency",
    description: "باكدج سريع للطوارئ والرحلات يشمل بطارية وإطار احتياطي وكشافات أمامية.",
    kmService: 0,
    basePrice: "4000",
    sellPrice: "3250",
    warrantyMonths: 6,
  },
];

const seedParts: SeedPart[] = [
  { name: "فلتر زيت", oemCode: "8200768913", type: "filter", priceOriginal: "150", priceTurkish: "85", priceChinese: "60", compatibleModels: "Renault Logan,Duster,Symbol", supplier: "مصطفى أوتوشوب", stockQty: 30 },
  { name: "فلتر هواء", oemCode: "8200228186", type: "filter", priceOriginal: "180", priceTurkish: "100", priceChinese: "70", compatibleModels: "Renault Logan,Duster,Symbol", supplier: "مصطفى أوتوشوب", stockQty: 24 },
  { name: "زيت محرك 5W30 (4 لتر)", oemCode: null, type: "oil", priceOriginal: "350", priceTurkish: null, priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب", stockQty: 40 },
  { name: "فلتر بنزين", oemCode: "7701478544", type: "filter", priceOriginal: "200", priceTurkish: "120", priceChinese: "85", compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب", stockQty: 18 },
  { name: "شمعات إشعال (4 حبة)", oemCode: "7700500168", type: "spark_plugs", priceOriginal: "400", priceTurkish: "240", priceChinese: "160", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب", stockQty: 16 },
  { name: "سير كاتينة", oemCode: "130C17384R", type: "belt", priceOriginal: "600", priceTurkish: "380", priceChinese: "260", compatibleModels: "Renault Logan,Symbol,Duster", supplier: "مصطفى أوتوشوب", stockQty: 10 },
  { name: "فلتر مكيف", oemCode: "272774EA0A", type: "filter", priceOriginal: "250", priceTurkish: "140", priceChinese: "90", compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب", stockQty: 20 },
  { name: "زيت فرامل DOT4", oemCode: null, type: "oil", priceOriginal: "180", priceTurkish: null, priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب", stockQty: 15 },
  { name: "ديسكات فرامل (أمامي)", oemCode: "7701206946", type: "brake", priceOriginal: "1200", priceTurkish: "750", priceChinese: "520", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب", stockQty: 8 },
  { name: "تيل فرامل (طقم)", oemCode: "7701207173", type: "brake", priceOriginal: "600", priceTurkish: "380", priceChinese: "270", compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب", stockQty: 14 },
  { name: "مساعدين أماميين", oemCode: "8200860019", type: "suspension", priceOriginal: "1800", priceTurkish: "1200", priceChinese: "850", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب", stockQty: 6 },
  { name: "بطارية 55 أمبير", oemCode: null, type: "battery", priceOriginal: "1500", priceTurkish: "1100", priceChinese: null, compatibleModels: "جميع موديلات رينو", supplier: "مصطفى أوتوشوب", stockQty: 9 },
  { name: "إطار احتياطي 185/65R15", oemCode: null, type: "tire", priceOriginal: "1200", priceTurkish: null, priceChinese: null, compatibleModels: "Renault Logan,Symbol", supplier: "مصطفى أوتوشوب", stockQty: 7 },
  { name: "كشافات LED أمامية (زوج)", oemCode: "7701057800", type: "lights", priceOriginal: "800", priceTurkish: "500", priceChinese: "350", compatibleModels: "Renault Logan,Duster", supplier: "مصطفى أوتوشوب", stockQty: 12 },
];

const packagePartsMap = [
  { pkgSlug: "pkg-20k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)"] },
  { pkgSlug: "pkg-40k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)"] },
  { pkgSlug: "pkg-60k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)", "سير كاتينة", "فلتر مكيف", "زيت فرامل DOT4"] },
  { pkgSlug: "pkg-100k", partNames: ["فلتر زيت", "فلتر هواء", "زيت محرك 5W30 (4 لتر)", "فلتر بنزين", "شمعات إشعال (4 حبة)", "سير كاتينة", "فلتر مكيف", "زيت فرامل DOT4", "ديسكات فرامل (أمامي)", "تيل فرامل (طقم)", "مساعدين أماميين"] },
  { pkgSlug: "emergency", partNames: ["بطارية 55 أمبير", "إطار احتياطي 185/65R15", "كشافات LED أمامية (زوج)"] },
];

const seedWorkshops: SeedWorkshop[] = [
  { name: "مركز ثمانية سلندر", area: "سيدي بشر", address: "شارع خالد ابن الوليد، سيدي بشر، الإسكندرية", phone: "01000000001", lat: "31.2600", lng: "30.0200", rating: "4.80", partnershipStatus: "active" },
  { name: "ورشة الإسكندرية للصيانة", area: "سموحة", address: "شارع التحرير، سموحة، الإسكندرية", phone: "01000000002", lat: "31.2100", lng: "29.9500", rating: "4.50", partnershipStatus: "active" },
  { name: "مركز رينو المنتزه", area: "المنتزه", address: "شارع أبو قير، المنتزه، الإسكندرية", phone: "01000000003", lat: "31.2900", lng: "30.0500", rating: "4.60", partnershipStatus: "active" },
  { name: "ورشة كليوباترا", area: "كليوباترا", address: "شارع بورسعيد، كليوباترا، الإسكندرية", phone: "01000000004", lat: "31.2450", lng: "29.9800", rating: "4.40", partnershipStatus: "active" },
];

async function upsertPackage(pkg: SeedPackage) {
  const existing = await db.query.packagesTable.findFirst({
    where: eq(packagesTable.slug, pkg.slug),
  });

  if (existing) {
    await db
      .update(packagesTable)
      .set(pkg)
      .where(eq(packagesTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(packagesTable).values(pkg).returning({ id: packagesTable.id });
  return inserted.id;
}

async function upsertPart(part: SeedPart) {
  const existing = await db.query.partsTable.findFirst({
    where: eq(partsTable.name, part.name),
  });

  const values = {
    ...part,
    stockQty: part.stockQty ?? 0,
  };

  if (existing) {
    await db
      .update(partsTable)
      .set(values)
      .where(eq(partsTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(partsTable).values(values).returning({ id: partsTable.id });
  return inserted.id;
}

async function upsertWorkshop(workshop: SeedWorkshop) {
  const existing = await db.query.workshopsTable.findFirst({
    where: eq(workshopsTable.name, workshop.name),
  });

  if (existing) {
    await db
      .update(workshopsTable)
      .set(workshop)
      .where(eq(workshopsTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(workshopsTable).values(workshop).returning({ id: workshopsTable.id });
  return inserted.id;
}

async function upsertUser(user: SeedUser) {
  const existing = await db.query.usersTable.findFirst({
    where: or(eq(usersTable.email, user.email), eq(usersTable.phone, user.phone)),
  });

  const values = {
    name: user.name,
    phone: user.phone,
    email: user.email,
    passwordHash: await bcrypt.hash(user.password, 10),
    role: user.role,
    employeeRole: user.employeeRole ?? null,
    workshopId: user.workshopId ?? null,
    area: user.area,
    carModel: user.carModel ?? null,
    carYear: user.carYear ?? null,
    address: user.address ?? null,
  };

  if (existing) {
    await db
      .update(usersTable)
      .set(values)
      .where(eq(usersTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(usersTable).values(values).returning({ id: usersTable.id });
  return inserted.id;
}

async function ensurePackagePart(packageId: number, partId: number) {
  const existing = await db.query.packagePartsTable.findFirst({
    where: and(eq(packagePartsTable.packageId, packageId), eq(packagePartsTable.partId, partId)),
  });

  if (existing) return;

  await db.insert(packagePartsTable).values({ packageId, partId });
}

async function ensureWorkshopPricing(workshopId: number, packageId: number, fee: string) {
  const existing = await db.query.workshopPricingTable.findFirst({
    where: and(eq(workshopPricingTable.workshopId, workshopId), eq(workshopPricingTable.packageId, packageId)),
  });

  if (existing) {
    await db
      .update(workshopPricingTable)
      .set({ fee })
      .where(eq(workshopPricingTable.id, existing.id));
    return;
  }

  await db.insert(workshopPricingTable).values({ workshopId, packageId, fee });
}

async function ensureSampleOrder(values: typeof ordersTable.$inferInsert, seedNote: string) {
  const existing = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.notes, seedNote),
  });

  const row = { ...values, notes: seedNote };

  if (existing) {
    const [updated] = await db
      .update(ordersTable)
      .set(row)
      .where(eq(ordersTable.id, existing.id))
      .returning({ id: ordersTable.id });
    return updated.id;
  }

  const [inserted] = await db.insert(ordersTable).values(row).returning({ id: ordersTable.id });
  return inserted.id;
}

async function ensureAppointment(values: typeof appointmentsTable.$inferInsert) {
  const existing = await db.query.appointmentsTable.findFirst({
    where: and(
      eq(appointmentsTable.orderId, values.orderId),
      eq(appointmentsTable.workshopId, values.workshopId),
      eq(appointmentsTable.date, values.date),
      eq(appointmentsTable.timeSlot, values.timeSlot),
    ),
  });

  if (existing) {
    await db
      .update(appointmentsTable)
      .set(values)
      .where(eq(appointmentsTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(appointmentsTable).values(values).returning({ id: appointmentsTable.id });
  return inserted.id;
}

async function ensureReview(values: typeof reviewsTable.$inferInsert) {
  const existing = await db.query.reviewsTable.findFirst({
    where: eq(reviewsTable.orderId, values.orderId),
  });

  if (existing) {
    await db
      .update(reviewsTable)
      .set(values)
      .where(eq(reviewsTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(reviewsTable).values(values).returning({ id: reviewsTable.id });
  return inserted.id;
}

async function ensureExpense(values: typeof expensesTable.$inferInsert) {
  const existing = await db.query.expensesTable.findFirst({
    where: and(
      eq(expensesTable.category, values.category),
      eq(expensesTable.description, values.description),
      eq(expensesTable.date, values.date),
    ),
  });

  if (existing) {
    await db
      .update(expensesTable)
      .set(values)
      .where(eq(expensesTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(expensesTable).values(values).returning({ id: expensesTable.id });
  return inserted.id;
}

async function ensureWorkshopApplication(values: typeof workshopApplicationsTable.$inferInsert) {
  const existing = await db.query.workshopApplicationsTable.findFirst({
    where: and(
      eq(workshopApplicationsTable.phone, values.phone),
      eq(workshopApplicationsTable.workshopName, values.workshopName),
    ),
  });

  if (existing) {
    await db
      .update(workshopApplicationsTable)
      .set(values)
      .where(eq(workshopApplicationsTable.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(workshopApplicationsTable).values(values).returning({ id: workshopApplicationsTable.id });
  return inserted.id;
}

async function upsertLead(lead: SeedLead) {
  const existing = await db.query.leadsTable.findFirst({
    where: and(eq(leadsTable.type, lead.type), eq(leadsTable.phone, lead.phone)),
  });

  if (existing) {
    const [updated] = await db
      .update(leadsTable)
      .set(lead)
      .where(eq(leadsTable.id, existing.id))
      .returning({ id: leadsTable.id });
    return updated.id;
  }

  const [inserted] = await db.insert(leadsTable).values(lead).returning({ id: leadsTable.id });
  return inserted.id;
}

async function upsertEmployeeTask(task: SeedEmployeeTask) {
  const existing = await db.query.employeeTasksTable.findFirst({
    where: and(eq(employeeTasksTable.employeeId, task.employeeId), eq(employeeTasksTable.title, task.title)),
  });

  if (existing) {
    const [updated] = await db
      .update(employeeTasksTable)
      .set(task)
      .where(eq(employeeTasksTable.id, existing.id))
      .returning({ id: employeeTasksTable.id });
    return updated.id;
  }

  const [inserted] = await db.insert(employeeTasksTable).values(task).returning({ id: employeeTasksTable.id });
  return inserted.id;
}

async function upsertEmployeeDailyReport(report: SeedEmployeeDailyReport) {
  const existing = await db.query.employeeDailyReportsTable.findFirst({
    where: and(eq(employeeDailyReportsTable.employeeId, report.employeeId), eq(employeeDailyReportsTable.reportDate, report.reportDate)),
  });

  if (existing) {
    const [updated] = await db
      .update(employeeDailyReportsTable)
      .set(report)
      .where(eq(employeeDailyReportsTable.id, existing.id))
      .returning({ id: employeeDailyReportsTable.id });
    return updated.id;
  }

  const [inserted] = await db.insert(employeeDailyReportsTable).values(report).returning({ id: employeeDailyReportsTable.id });
  return inserted.id;
}

async function seed() {
  console.log("🌱 Seeding RenoPack staging data...");

  const packageIds = new Map<string, number>();
  for (const pkg of seedPackages) {
    packageIds.set(pkg.slug, await upsertPackage(pkg));
  }
  console.log(`✅ Packages ready: ${packageIds.size}`);

  const partIds = new Map<string, number>();
  for (const part of seedParts) {
    partIds.set(part.name, await upsertPart(part));
  }
  console.log(`✅ Parts ready: ${partIds.size}`);

  for (const mapping of packagePartsMap) {
    const packageId = packageIds.get(mapping.pkgSlug);
    if (!packageId) continue;

    for (const partName of mapping.partNames) {
      const partId = partIds.get(partName);
      if (!partId) continue;
      await ensurePackagePart(packageId, partId);
    }
  }
  console.log("✅ Package parts linked");

  const workshopIds = new Map<string, number>();
  for (const workshop of seedWorkshops) {
    workshopIds.set(workshop.name, await upsertWorkshop(workshop));
  }
  console.log(`✅ Workshops ready: ${workshopIds.size}`);

  const primaryWorkshopId = workshopIds.get("مركز ثمانية سلندر");
  if (!primaryWorkshopId) {
    throw new Error("Primary workshop was not created");
  }

  const adminUserId = await upsertUser({
    name: "مدير النظام",
    phone: "01000000000",
    email: "admin@renaultparts.eg",
    password: "admin123",
    role: "admin",
    area: "الإسكندرية",
  });

  const customerUserId = await upsertUser({
    name: "عميل تجريبي",
    phone: "01010000001",
    email: "customer@renaultparts.eg",
    password: "customer123",
    role: "customer",
    area: "سيدي بشر",
    carModel: "Renault Logan",
    carYear: 2019,
    address: "شارع 45، سيدي بشر، الإسكندرية",
  });

  const workshopOwnerId = await upsertUser({
    name: "صاحب ورشة تجريبي",
    phone: "01010000006",
    email: "workshop@renaultparts.eg",
    password: "workshop123",
    role: "workshop_owner",
    workshopId: primaryWorkshopId,
    area: "سيدي بشر",
  });

  await upsertUser({
    name: "موظف مبيعات",
    phone: "01010000010",
    email: "sales@renaultparts.eg",
    password: "sales123",
    role: "employee",
    employeeRole: "sales",
    area: "سموحة",
  });
  const salesUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "sales@renaultparts.eg") });

  await upsertUser({
    name: "موظف إدخال بيانات",
    phone: "01010000011",
    email: "dataentry@renaultparts.eg",
    password: "dataentry123",
    role: "employee",
    employeeRole: "data_entry",
    area: "لوران",
  });
  const dataEntryUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "dataentry@renaultparts.eg") });

  await upsertUser({
    name: "خبير فني",
    phone: "01010000012",
    email: "technical@renaultparts.eg",
    password: "technical123",
    role: "employee",
    employeeRole: "technical_expert",
    area: "ميامي",
  });
  const technicalUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "technical@renaultparts.eg") });

  await upsertUser({
    name: "تسويق وتقنية",
    phone: "01010000014",
    email: "marketing@renaultparts.eg",
    password: "marketing123",
    role: "employee",
    employeeRole: "marketing_tech",
    area: "الإسكندرية",
  });
  const marketingUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "marketing@renaultparts.eg") });

  await upsertUser({
    name: "مدير فريق",
    phone: "01010000013",
    email: "manager@renaultparts.eg",
    password: "manager123",
    role: "employee",
    employeeRole: "manager",
    area: "سموحة",
  });
  const managerUser = await db.query.usersTable.findFirst({ where: eq(usersTable.email, "manager@renaultparts.eg") });
  console.log("✅ Demo users ready");

  if (!salesUser || !dataEntryUser || !technicalUser || !marketingUser || !managerUser) {
    throw new Error("Sales workspace demo employees were not created");
  }

  const pkg20kId = packageIds.get("pkg-20k");
  const pkg40kId = packageIds.get("pkg-40k");
  if (!pkg20kId || !pkg40kId) {
    throw new Error("Required demo packages are missing");
  }

  await ensureWorkshopPricing(primaryWorkshopId, pkg20kId, "240");
  await ensureWorkshopPricing(primaryWorkshopId, pkg40kId, "300");
  console.log("✅ Workshop pricing ready");

  const confirmedOrderId = await ensureSampleOrder(
    {
      userId: customerUserId,
      packageId: pkg20kId,
      workshopId: null,
      status: "confirmed",
      paymentMethod: "vodafone_cash",
      paymentStatus: "paid",
      total: "1040",
      deliveryAddress: "استلام من مركز التوزيع",
      deliveryArea: "الإسكندرية",
      carModel: "Renault Logan",
      carYear: 2019,
      notes: "",
    },
    "[seed] confirmed-order",
  );

  const completedOrderId = await ensureSampleOrder(
    {
      userId: customerUserId,
      packageId: pkg20kId,
      workshopId: primaryWorkshopId,
      status: "completed",
      paymentMethod: "instapay",
      paymentStatus: "paid",
      total: "1040",
      deliveryAddress: "العميل سيذهب للورشة",
      deliveryArea: "سيدي بشر",
      carModel: "Renault Logan",
      carYear: 2019,
      notes: "",
    },
    "[seed] completed-order",
  );

  await ensureAppointment({
    orderId: completedOrderId,
    workshopId: primaryWorkshopId,
    workshopName: "مركز ثمانية سلندر",
    date: "2026-03-23",
    timeSlot: "12:00-02:00",
    status: "completed",
    changeNote: "تم تنفيذ الموعد بنجاح ضمن بيانات الـ staging.",
  });

  await ensureReview({
    orderId: completedOrderId,
    userId: customerUserId,
    workshopId: primaryWorkshopId,
    rating: 5,
    comment: "الخدمة ممتازة والتركيب تم في الموعد والمتابعة كانت محترمة جدًا.",
    adminReply: "شكرًا لتقييمك، ونسعد دائمًا بخدمتك في رينو باك.",
  });

  await ensureExpense({
    category: "تشغيل",
    description: "مصاريف نقل وتجهيز طلبات الـ staging",
    amount: "350.00",
    date: "2026-03-20",
    createdBy: adminUserId,
  });

  await ensureWorkshopApplication({
    userId: workshopOwnerId,
    ownerName: "محمود صابر",
    workshopName: "ورشة سبيد رينو",
    phone: "01033334444",
    area: "جليم",
    address: "شارع أبو قير، جليم، الإسكندرية",
    yearsExperience: "11",
    specialties: "رينو - ميكانيكا - كهرباء - فحص كمبيوتر",
    notes: "طلب انضمام تجريبي لاختبار شاشة الإدارة.",
  });

  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(10, 0, 0, 0);
  const tomorrowAfternoon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowAfternoon.setHours(14, 30, 0, 0);

  const assignedCustomerLeadId = await upsertLead({
    type: "customer",
    name: "أحمد رمضان",
    phone: "01020000001",
    email: "ahmad.ramadan@example.com",
    area: "سيدي بشر",
    address: "شارع 45، سيدي بشر",
    carModel: "Renault Logan",
    carYear: 2018,
    source: "data_entry",
    status: "follow_up_later",
    assignedEmployeeId: salesUser.id,
    createdByUserId: adminUserId,
    lastContactAt: now,
    nextFollowUpAt: inTwoHours,
    notes: "طلب عرض سعر لباكدج 40 ألف كم، ويفضل التواصل بعد المغرب.",
  });

  await upsertLead({
    type: "customer",
    name: "محمد جابر",
    phone: "01020000002",
    email: "m.gaber@example.com",
    area: "سموحة",
    address: "ميدان فيكتور عمانويل",
    carModel: "Renault Duster",
    carYear: 2020,
    source: "sales_walkin",
    status: "new",
    assignedEmployeeId: salesUser.id,
    createdByUserId: salesUser.id,
    nextFollowUpAt: tomorrowMorning,
    notes: "عميل جديد يحتاج تحديد موعد مكالمة أولى.",
  });

  await upsertLead({
    type: "customer",
    name: "سيف عماد",
    phone: "01020000009",
    email: "seif.emad@example.com",
    area: "العصافرة",
    address: "شارع 45، العصافرة",
    carModel: "Renault Sandero",
    carYear: 2021,
    source: "data_entry",
    status: "new",
    assignedEmployeeId: null,
    createdByUserId: dataEntryUser.id,
    nextFollowUpAt: tomorrowMorning,
    notes: "Lead جديدة من إدخال البيانات وتحتاج توزيع على أحد مندوبي المبيعات.",
  });

  await upsertLead({
    type: "customer",
    name: "نورا أشرف",
    phone: "01020000010",
    email: "nora.ashraf@example.com",
    area: "لوران",
    address: "شارع شعراوي، لوران",
    carModel: "Renault Fluence",
    carYear: 2017,
    source: "data_entry",
    status: "attempted_contact",
    technicalCategory: "electrical",
    technicalPriority: "high",
    transferDecision: "keep_with_technical",
    knowledgeNotes: "اشتباه مشكلة كهرباء في دائرة المروحة. يفضل بدء فحص كمبيوتر ثم مراجعة الفيوزات والريلاي قبل التحويل للمبيعات.",
    assignedEmployeeId: technicalUser.id,
    createdByUserId: dataEntryUser.id,
    lastContactAt: now,
    nextFollowUpAt: tomorrowMorning,
    notes: "تحتاج متابعة فنية أولية لتأكيد المشكلة قبل تحويلها للمبيعات.",
  });

  await upsertLead({
    type: "customer",
    name: "كريم السعيد",
    phone: "01020000003",
    email: "karim.elsaeed@example.com",
    area: "لوران",
    address: "شارع مصطفى كامل",
    carModel: "Renault Megane",
    carYear: 2019,
    source: "landing_page",
    status: "converted_to_order",
    assignedEmployeeId: salesUser.id,
    createdByUserId: adminUserId,
    lastContactAt: now,
    nextFollowUpAt: null,
    convertedOrderId: confirmedOrderId,
    notes: "تم تحويله إلى طلب فعلي بعد مكالمة متابعة ناجحة.",
  });

  const assignedWorkshopLeadId = await upsertLead({
    type: "workshop",
    name: "ورشة النخبة",
    contactPerson: "م. حسام",
    phone: "01030000001",
    email: "elite.workshop@example.com",
    area: "ميامي",
    address: "شارع جمال عبد الناصر، ميامي",
    source: "sales_visit",
    status: "negotiation",
    assignedEmployeeId: salesUser.id,
    createdByUserId: salesUser.id,
    lastContactAt: now,
    nextFollowUpAt: tomorrowAfternoon,
    notes: "الورشة مهتمة بالشراكة وتطلب تفاصيل العمولة وسرعة التوريد.",
  });

  await upsertLead({
    type: "workshop",
    name: "جراج الصفوة",
    contactPerson: "أ. وليد",
    phone: "01030000002",
    email: "safwa.garage@example.com",
    area: "العصافرة",
    address: "شارع 30، العصافرة",
    source: "data_entry",
    status: "converted_to_application",
    assignedEmployeeId: salesUser.id,
    createdByUserId: adminUserId,
    lastContactAt: now,
    nextFollowUpAt: null,
    convertedWorkshopId: primaryWorkshopId,
    notes: "تمت المتابعة ورفعها كحالة انضمام، وهي الآن تحت متابعة الإدارة.",
  });

  await upsertLead({
    type: "workshop",
    name: "مركز الشروق",
    contactPerson: "م. إيهاب",
    phone: "01030000009",
    email: "shorouk.center@example.com",
    area: "محرم بك",
    address: "شارع الرصافة، محرم بك",
    source: "data_entry",
    status: "new",
    assignedEmployeeId: null,
    createdByUserId: dataEntryUser.id,
    nextFollowUpAt: tomorrowAfternoon,
    notes: "ورشة جديدة تحتاج إسناد أولي لفريق المبيعات ومكالمة تعريف.",
  });

  await upsertLead({
    type: "workshop",
    name: "ورشة المدينة",
    contactPerson: "أ. كريم",
    phone: "01030000010",
    email: "madina.workshop@example.com",
    area: "كامب شيزار",
    address: "شارع بورسعيد، كامب شيزار",
    source: "data_entry",
    status: "follow_up_later",
    technicalCategory: "workshop_relation",
    technicalPriority: "medium",
    transferDecision: "workshop",
    knowledgeNotes: "الورشة تحتاج شرحًا لطبيعة الباكدجات وآلية التعامل مع المرتجعات والقطع البديلة قبل الإحالة للمبيعات.",
    assignedEmployeeId: technicalUser.id,
    createdByUserId: dataEntryUser.id,
    lastContactAt: now,
    nextFollowUpAt: tomorrowAfternoon,
    notes: "الورشة بحاجة لشرح فني وتشغيلي أولًا قبل الإحالة لفريق المبيعات.",
  });

  await upsertEmployeeTask({
    employeeId: salesUser.id,
    leadId: assignedCustomerLeadId,
    title: "متابعة عرض سعر أحمد رمضان",
    taskType: "call",
    area: "سيدي بشر",
    dueAt: inTwoHours,
    status: "pending",
    notes: "تأكيد اهتمامه بباكدج 40 ألف كم وإرسال عرض مناسب.",
    createdByUserId: adminUserId,
  });

  await upsertEmployeeTask({
    employeeId: salesUser.id,
    leadId: assignedWorkshopLeadId,
    title: "زيارة ورشة النخبة",
    taskType: "visit",
    area: "ميامي",
    dueAt: tomorrowAfternoon,
    status: "in_progress",
    notes: "مراجعة احتياجات الورشة والاتفاق على خطوات الانضمام.",
    createdByUserId: adminUserId,
  });

  await upsertEmployeeTask({
    employeeId: salesUser.id,
    title: "تجهيز كشف متابعة اليوم",
    taskType: "follow_up",
    area: "سموحة",
    dueAt: tomorrowMorning,
    status: "pending",
    notes: "ترتيب العملاء المطلوب التواصل معهم قبل نهاية اليوم.",
    createdByUserId: adminUserId,
  });

  await upsertEmployeeTask({
    employeeId: salesUser.id,
    title: "متابعة العملاء الجدد غير الموزعين",
    taskType: "follow_up",
    area: "العصافرة",
    dueAt: tomorrowAfternoon,
    status: "pending",
    notes: "مهمة مسندة من مدير الفريق لمراجعة الفرص الجديدة داخل الـ pipeline.",
    createdByUserId: managerUser.id,
  });

  await upsertEmployeeTask({
    employeeId: dataEntryUser.id,
    title: "إدخال بيانات العملاء الواردة من حملة سموحة",
    taskType: "data_entry",
    area: "سموحة",
    dueAt: tomorrowMorning,
    status: "pending",
    notes: "إدخال البيانات مع تحديد الأولوية وتعيين الحالات العاجلة للمبيعات أو الخبير الفني.",
    createdByUserId: managerUser.id,
  });

  await upsertEmployeeTask({
    employeeId: technicalUser.id,
    title: "متابعة الشكاوى المفتوحة من leads إدخال البيانات",
    taskType: "issue_resolution",
    area: "لوران",
    dueAt: tomorrowAfternoon,
    status: "pending",
    notes: "التأكد من استكمال بيانات الحالات التي تحتاج دعمًا فنيًا قبل تحويلها إلى المبيعات.",
    createdByUserId: managerUser.id,
  });

  await upsertEmployeeTask({
    employeeId: managerUser.id,
    title: "توزيع leads اليوم على الفريق",
    taskType: "follow_up",
    area: "الإسكندرية",
    dueAt: tomorrowMorning,
    status: "in_progress",
    notes: "مراجعة العملاء والورش غير المسندة وإعادة توزيعها على المبيعات والخبير الفني.",
    createdByUserId: adminUserId,
  });

  await upsertEmployeeDailyReport({
    employeeId: salesUser.id,
    reportDate: "2026-03-25",
    summary: "تمت متابعة عملاء المبيعات المفتوحين وتم تحويل عميل واحد إلى طلب فعلي.",
    achievements: "مكالمة ناجحة مع أحمد رمضان وتحويل كريم السعيد إلى طلب مؤكد.",
    blockers: "تأخر رد بعض العملاء في فترة الظهيرة.",
    nextSteps: "استكمال متابعة الورش الجديدة وجدولة زيارتين ميدانيتين.",
  });

  await upsertEmployeeDailyReport({
    employeeId: dataEntryUser.id,
    reportDate: "2026-03-25",
    summary: "تم إدخال دفعة جديدة من العملاء والورش مع تصنيفها وتوجيه جزء منها للفريق.",
    achievements: "إضافة سجلات جديدة من منطقة لوران وكامب شيزار وربطها بمسار المتابعة.",
    blockers: "بعض الأرقام تحتاج مراجعة بسبب نقص البيانات.",
    nextSteps: "استكمال تدقيق الدفعة القادمة وتوزيع الحالات الساخنة على المبيعات أو الخبير الفني.",
  });

  await upsertEmployeeDailyReport({
    employeeId: technicalUser.id,
    reportDate: "2026-03-25",
    summary: "تمت متابعة الحالات الفنية المفتوحة وتم تحديث وضعها داخل النظام.",
    achievements: "مراجعة حالتين مفتوحتين وتأكيد البيانات الفنية ومواعيد المتابعة.",
    blockers: "عدد من الحالات يحتاج معلومات فنية إضافية من الورش.",
    nextSteps: "إغلاق الحالات المكتملة ورفع غير المكتمل لمدير الفريق أو تحويله للمبيعات.",
  });

  await upsertEmployeeDailyReport({
    employeeId: marketingUser.id,
    reportDate: "2026-03-25",
    summary: "تمت مراجعة رسائل المتابعة التسويقية ولوحة النظام وتحديد عناصر التحسين.",
    achievements: "تحديث أولويات المتابعة واقتراح تحسينات على رحلة التحويل داخل المنصة.",
    blockers: "نقص بيانات كافية عن بعض الحملات ومصادر العملاء.",
    nextSteps: "مراجعة مصادر العملاء وتحسين رسائل المتابعة وربطها بالتقارير.",
  });

  await upsertEmployeeDailyReport({
    employeeId: managerUser.id,
    reportDate: "2026-03-25",
    summary: "تم توزيع فرص اليوم ومراجعة أداء الفريق وتحديد أولويات اليوم التالي.",
    achievements: "إسناد مهام جديدة للمبيعات، والداتا، والخبرة الفنية.",
    blockers: "وجود فرص غير مكتملة البيانات تحتاج متابعة إضافية.",
    nextSteps: "إعادة توزيع الـ pipeline المفتوح ومراجعة التقارير اليومية صباحًا.",
  });

  console.log("✅ Orders, appointment, review, expense, workshop application, employee tasks, and daily reports ready");
  console.log("🔐 Admin: admin@renaultparts.eg / admin123");
  console.log("👤 Customer: customer@renaultparts.eg / customer123");
  console.log("🛠️ Workshop: workshop@renaultparts.eg / workshop123");
  console.log("💼 Employees: sales / dataentry / technical / marketing / manager @renaultparts.eg");
  console.log("🎉 Staging seed complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
