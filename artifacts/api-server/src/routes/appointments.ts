import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, appointmentsTable, workshopsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

// Max clients per hour slot per workshop
const SLOT_CAPACITY = 2;
const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

// GET /api/appointments/slots?workshopId=X&date=YYYY-MM-DD
router.get("/appointments/slots", async (req, res): Promise<void> => {
  const { workshopId, date } = req.query;
  if (!workshopId || !date) {
    res.status(400).json({ error: "workshopId and date are required" });
    return;
  }
  const booked = await db
    .select({ timeSlot: appointmentsTable.timeSlot })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.workshopId, Number(workshopId)),
        eq(appointmentsTable.date, String(date)),
        ne(appointmentsTable.status, "cancelled")
      )
    );
  // Count bookings per slot
  const slotCounts: Record<string, number> = {};
  for (const b of booked) {
    slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
  }
  // A slot is "full" when it has reached SLOT_CAPACITY bookings
  const fullSlots = ALL_SLOTS.filter(s => (slotCounts[s] || 0) >= SLOT_CAPACITY);
  res.json({ slots: ALL_SLOTS, bookedSlots: fullSlots, slotCounts });
});

// POST /api/appointments — create appointment after order confirmed
router.post("/appointments", requireAuth, async (req, res): Promise<void> => {
  const { orderId, workshopId, date, timeSlot, workshopName: bodyWorkshopName } = req.body;
  if (!orderId || !workshopId || !date || !timeSlot) {
    res.status(400).json({ error: "orderId, workshopId, date, timeSlot are required" });
    return;
  }
  // Check slot capacity (max 2 per slot)
  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.workshopId, Number(workshopId)),
        eq(appointmentsTable.date, String(date)),
        eq(appointmentsTable.timeSlot, String(timeSlot)),
        ne(appointmentsTable.status, "cancelled")
      )
    );
  if (existing.length >= SLOT_CAPACITY) {
    res.status(409).json({ error: "هذا الموعد اكتمل — اختار وقتاً آخر" });
    return;
  }
  // Fetch workshop name (fall back to body-provided name for static workshops)
  const [workshop] = await db.select().from(workshopsTable).where(eq(workshopsTable.id, Number(workshopId)));
  const resolvedWorkshopName = workshop?.name ?? bodyWorkshopName ?? `ورشة ${workshopId}`;
  const [appt] = await db.insert(appointmentsTable).values({
    orderId: Number(orderId),
    workshopId: Number(workshopId),
    workshopName: resolvedWorkshopName,
    date: String(date),
    timeSlot: String(timeSlot),
    status: "confirmed",
  }).returning();

  res.status(201).json(appt);
});

// GET /api/appointments/order/:orderId — get appointment for order
router.get("/appointments/order/:orderId", requireAuth, async (req, res): Promise<void> => {
  const orderId = Number(req.params.orderId);
  const [appt] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.orderId, orderId));
  if (!appt) {
    res.status(404).json({ error: "لا يوجد موعد لهذا الطلب" });
    return;
  }
  res.json(appt);
});

// POST /api/appointments/:id/change-request — request change
router.post("/appointments/:id/change-request", requireAuth, async (req, res): Promise<void> => {
  const apptId = Number(req.params.id);
  const { note } = req.body;
  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: "change_requested", changeNote: note || null })
    .where(eq(appointmentsTable.id, apptId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "الموعد غير موجود" });
    return;
  }
  res.json(updated);
});

export default router;
