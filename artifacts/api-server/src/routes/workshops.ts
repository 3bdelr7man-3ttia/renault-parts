import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, workshopsTable } from "@workspace/db";
import { ListWorkshopsQueryParams, ListWorkshopsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workshops", async (req, res): Promise<void> => {
  const queryParsed = ListWorkshopsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  let query = db.select().from(workshopsTable).$dynamic();
  if (queryParsed.data.area) {
    query = query.where(eq(workshopsTable.area, queryParsed.data.area));
  }

  const workshops = await query;

  const result = workshops.map((w) => ({
    id: w.id,
    name: w.name,
    area: w.area,
    address: w.address,
    phone: w.phone,
    lat: w.lat ? Number(w.lat) : null,
    lng: w.lng ? Number(w.lng) : null,
    rating: w.rating ? Number(w.rating) : null,
    partnershipStatus: w.partnershipStatus,
  }));

  res.json(ListWorkshopsResponse.parse(result));
});

export default router;
