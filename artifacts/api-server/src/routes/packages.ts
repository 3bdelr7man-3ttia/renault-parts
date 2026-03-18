import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, packagesTable, partsTable, packagePartsTable } from "@workspace/db";
import { GetPackageBySlugParams, ListPackagesResponse, GetPackageBySlugResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function getPackageWithParts(packageId: number) {
  const parts = await db
    .select({ part: partsTable })
    .from(packagePartsTable)
    .innerJoin(partsTable, eq(packagePartsTable.partId, partsTable.id))
    .where(eq(packagePartsTable.packageId, packageId));

  return parts.map((row) => ({
    id: row.part.id,
    name: row.part.name,
    oemCode: row.part.oemCode,
    type: row.part.type,
    priceOriginal: row.part.priceOriginal ? Number(row.part.priceOriginal) : null,
    priceTurkish: row.part.priceTurkish ? Number(row.part.priceTurkish) : null,
    priceChinese: row.part.priceChinese ? Number(row.part.priceChinese) : null,
    compatibleModels: row.part.compatibleModels,
    supplier: row.part.supplier,
  }));
}

router.get("/packages", async (_req, res): Promise<void> => {
  const packages = await db.select().from(packagesTable).orderBy(packagesTable.kmService);

  const result = await Promise.all(
    packages.map(async (pkg) => {
      const parts = await getPackageWithParts(pkg.id);
      return {
        id: pkg.id,
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        kmService: pkg.kmService,
        basePrice: Number(pkg.basePrice),
        sellPrice: Number(pkg.sellPrice),
        warrantyMonths: pkg.warrantyMonths,
        parts,
        createdAt: pkg.createdAt,
      };
    })
  );

  res.json(ListPackagesResponse.parse(result));
});

router.get("/packages/:slug", async (req, res): Promise<void> => {
  const params = GetPackageBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pkg] = await db
    .select()
    .from(packagesTable)
    .where(eq(packagesTable.slug, params.data.slug));

  if (!pkg) {
    res.status(404).json({ error: "الباكدج غير موجود" });
    return;
  }

  const parts = await getPackageWithParts(pkg.id);

  const result = {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    kmService: pkg.kmService,
    basePrice: Number(pkg.basePrice),
    sellPrice: Number(pkg.sellPrice),
    warrantyMonths: pkg.warrantyMonths,
    parts,
    createdAt: pkg.createdAt,
  };

  res.json(GetPackageBySlugResponse.parse(result));
});

export default router;
