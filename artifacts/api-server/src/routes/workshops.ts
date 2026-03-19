import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, workshopsTable, workshopApplicationsTable } from "@workspace/db";
import { ListWorkshopsQueryParams, ListWorkshopsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workshops", async (req, res): Promise<void> => {
  const queryParsed = ListWorkshopsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const conditions = [eq(workshopsTable.partnershipStatus, "active")];
  if (queryParsed.data.area) {
    conditions.push(eq(workshopsTable.area, queryParsed.data.area));
  }

  const workshops = await db
    .select()
    .from(workshopsTable)
    .where(and(...conditions));

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

router.post("/workshops/apply", async (req, res): Promise<void> => {
  const { ownerName, workshopName, phone, area, address, yearsExperience, specialties, notes } = req.body;

  if (!ownerName || !workshopName || !phone || !area || !address || !yearsExperience || !specialties) {
    res.status(400).json({ error: "جميع الحقول المطلوبة يجب تعبئتها" });
    return;
  }

  const [app] = await db
    .insert(workshopApplicationsTable)
    .values({ ownerName, workshopName, phone, area, address, yearsExperience, specialties, notes: notes || null })
    .returning();

  res.status(201).json({ id: app.id, message: "تم إرسال طلبك بنجاح! سيتم مراجعته والرد عليك قريباً." });
});

export default router;
