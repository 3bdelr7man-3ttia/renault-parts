import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, appointmentsTable, workshopsTable, workshopAvailabilityTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const SLOT_CAPACITY = 2;
const ALL_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

// GET /api/appointments/slots?workshopId=X&date=YYYY-MM-DD
// Returns workshop's configured available slots for that day (minus full ones)
router.get("/appointments/slots", async (req, res): Promise<void> => {
  const { workshopId, date } = req.query;
  if (!workshopId || !date) {
    res.status(400).json({ error: "workshopId and date are required" });
    return;
  }

  const wid = Number(workshopId);
  const dateStr = String(date);

  // Determine day of week from date (0=Sun, 1=Mon, ..., 6=Sat)
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Fetch this workshop's configured availability for this day of week
  const availability = await db
    .select()
    .from(workshopAvailabilityTable)
    .where(
      and(
        eq(workshopAvailabilityTable.workshopId, wid),
        eq(workshopAvailabilityTable.dayOfWeek, dayOfWeek)
      )
    );

  let configuredSlots: string[];
  const slotMaxBookings: Record<string, number> = {};

  if (availability.length === 0) {
    // No config yet — fall back to all slots with default capacity
    configuredSlots = ALL_SLOTS;
    for (const s of ALL_SLOTS) slotMaxBookings[s] = SLOT_CAPACITY;
  } else {
    configuredSlots = availability.map(a => a.timeSlot).sort();
    for (const a of availability) slotMaxBookings[a.timeSlot] = a.maxBookings;
  }

  // Get existing non-cancelled bookings for this workshop + date
  const booked = await db
    .select({ timeSlot: appointmentsTable.timeSlot })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.workshopId, wid),
        eq(appointmentsTable.date, dateStr),
        ne(appointmentsTable.status, "cancelled")
      )
    );

  const slotCounts: Record<string, number> = {};
  for (const b of booked) {
    slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
  }

  // Full slots = those that have reached their configured max bookings
  const bookedSlots = configuredSlots.filter(s => (slotCounts[s] || 0) >= slotMaxBookings[s]);

  const hasConfig = availability.length > 0;

  res.json({ slots: configuredSlots, bookedSlots, slotCounts, hasConfig });
});

// POST /api/appointments — create appointment after order confirmed
router.post("/appointments", requireAuth, async (req, res): Promise<void> => {
  const { orderId, workshopId, date, timeSlot, workshopName: bodyWorkshopName } = req.body;
  if (!orderId || !workshopId || !date || !timeSlot) {
    res.status(400).json({ error: "orderId, workshopId, date, timeSlot are required" });
    return;
  }

  const wid = Number(workshopId);
  const dateStr = String(date);
  const slotStr = String(timeSlot);
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Determine capacity for this slot
  const [avail] = await db
    .select()
    .from(workshopAvailabilityTable)
    .where(
      and(
        eq(workshopAvailabilityTable.workshopId, wid),
        eq(workshopAvailabilityTable.dayOfWeek, dayOfWeek),
        eq(workshopAvailabilityTable.timeSlot, slotStr)
      )
    );

  const maxBookings = avail?.maxBookings ?? SLOT_CAPACITY;

  // Check slot capacity
  const existing = await db
    .select()
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.workshopId, wid),
        eq(appointmentsTable.date, dateStr),
        eq(appointmentsTable.timeSlot, slotStr),
        ne(appointmentsTable.status, "cancelled")
      )
    );

  if (existing.length >= maxBookings) {
    res.status(409).json({ error: "هذا الموعد اكتمل — اختار وقتاً آخر" });
    return;
  }

  // Fetch workshop name
  const [workshop] = await db.select().from(workshopsTable).where(eq(workshopsTable.id, wid));
  const resolvedWorkshopName = workshop?.name ?? bodyWorkshopName ?? `ورشة ${workshopId}`;

  const [appt] = await db.insert(appointmentsTable).values({
    orderId: Number(orderId),
    workshopId: wid,
    workshopName: resolvedWorkshopName,
    date: dateStr,
    timeSlot: slotStr,
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
