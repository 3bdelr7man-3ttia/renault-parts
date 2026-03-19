import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, partsTable, packagePartsTable } from "@workspace/db";
import { ListPartsQueryParams, ListPartsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function normalizePart(part: typeof partsTable.$inferSelect) {
  return {
    id: part.id,
    name: part.name,
    oemCode: part.oemCode ?? null,
    type: part.type,
    priceOriginal: part.priceOriginal != null ? Number(part.priceOriginal) : null,
    priceTurkish: part.priceTurkish != null ? Number(part.priceTurkish) : null,
    priceChinese: part.priceChinese != null ? Number(part.priceChinese) : null,
    compatibleModels: part.compatibleModels ?? null,
    supplier: part.supplier ?? null,
    imageUrl: part.imageUrl ?? null,
  };
}

router.get("/parts", async (req, res): Promise<void> => {
  const parsed = ListPartsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { packageId, type } = parsed.data;

  if (packageId != null) {
    const rows = await db
      .select({ part: partsTable })
      .from(packagePartsTable)
      .innerJoin(partsTable, eq(packagePartsTable.partId, partsTable.id))
      .where(eq(packagePartsTable.packageId, packageId));

    res.json(ListPartsResponse.parse(rows.map((r) => normalizePart(r.part))));
    return;
  }

  const all = await db.select().from(partsTable);
  const filtered = type ? all.filter((p) => p.type === type) : all;
  res.json(ListPartsResponse.parse(filtered.map(normalizePart)));
});

export default router;
