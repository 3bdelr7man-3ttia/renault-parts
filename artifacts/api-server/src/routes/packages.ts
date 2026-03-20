import { Router, type IRouter, type Request, type Response } from "express";
import { eq, notLike, gt } from "drizzle-orm";
import { db, packagesTable, partsTable, packagePartsTable } from "@workspace/db";
import { GetPackageBySlugParams, ListPackagesResponse, GetPackageBySlugResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

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
  const packages = await db
    .select()
    .from(packagesTable)
    .where(gt(packagesTable.kmService, 0))
    .orderBy(packagesTable.kmService);

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

router.post("/packages/custom", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { parts, total } = req.body as { parts: Array<{ label: string; price: number }>; total: number };

  if (!Array.isArray(parts) || parts.length === 0 || typeof total !== "number") {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }

  const slug = `custom-${Date.now()}`;
  const partsList = parts.map((p) => p.label).join("، ");

  const [pkg] = await db
    .insert(packagesTable)
    .values({
      name: "باكدج مخصص من البازل",
      slug,
      description: `باكدج مخصص يحتوي على: ${partsList}`,
      kmService: 0,
      basePrice: String(total),
      sellPrice: String(total),
      warrantyMonths: 3,
      isAvailable: true,
    })
    .returning();

  res.json({ packageId: pkg.id });
});

export default router;
