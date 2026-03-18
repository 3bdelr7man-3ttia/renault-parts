import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, partsTable, packagePartsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/parts", async (req, res): Promise<void> => {
  const { packageId, type } = req.query as Record<string, string | undefined>;

  if (packageId) {
    const id = Number(packageId);
    if (isNaN(id)) {
      res.status(400).json({ error: "packageId must be a number" });
      return;
    }
    const rows = await db
      .select({ part: partsTable })
      .from(packagePartsTable)
      .innerJoin(partsTable, eq(packagePartsTable.partId, partsTable.id))
      .where(eq(packagePartsTable.packageId, id));

    res.json(rows.map((r) => r.part));
    return;
  }

  const all = await db.select().from(partsTable);
  const filtered = type ? all.filter((p) => p.type === type) : all;
  res.json(filtered);
});

export default router;
