import { Router, type IRouter } from "express";
import { and, desc, eq, or } from "drizzle-orm";
import { db, leadsTable, usersTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  GetCurrentUserResponse,
} from "@workspace/api-zod";
import { hashPassword, comparePassword, signToken, requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { normalizeEmployeeRole, normalizeRole } from "../lib/permissions";

const router: IRouter = Router();

function buildUserOut(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    carModel: user.carModel,
    carYear: user.carYear,
    address: user.address,
    area: user.area,
    role: normalizeRole(user.role),
    employeeRole: normalizeEmployeeRole(user.employeeRole),
    workshopId: user.workshopId ?? null,
    createdAt: user.createdAt,
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, email, password, carModel, carYear, address, area } = parsed.data;

  if (!phone && !email) {
    res.status(400).json({ error: "يجب تقديم رقم الهاتف أو البريد الإلكتروني على الأقل" });
    return;
  }

  const conditions: ReturnType<typeof eq>[] = [];
  if (phone) conditions.push(eq(usersTable.phone, phone));
  if (email) conditions.push(eq(usersTable.email, email));
  const [existing] = await db.select().from(usersTable).where(or(...conditions));
  if (existing) {
    res.status(409).json({ error: "رقم الهاتف أو البريد الإلكتروني مسجل بالفعل" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(usersTable).values({
    name,
    phone: phone ?? null,
    email: email ?? null,
    passwordHash,
    carModel: carModel ?? null,
    carYear: carYear ?? null,
    address: address ?? null,
    area: area ?? null,
    role: "customer",
  }).returning();

  const leadConditions: ReturnType<typeof eq>[] = [];
  if (phone) leadConditions.push(eq(leadsTable.phone, phone));
  if (email) leadConditions.push(eq(leadsTable.email, email));

  if (leadConditions.length > 0) {
    const [matchingLead] = await db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(and(eq(leadsTable.type, "customer"), or(...leadConditions)))
      .orderBy(desc(leadsTable.createdAt))
      .limit(1);

    if (matchingLead) {
      await db
        .update(leadsTable)
        .set({
          registeredUserId: user.id,
          status: "registered_on_platform",
          lastContactAt: new Date(),
        })
        .where(eq(leadsTable.id, matchingLead.id));
    }
  }

  const token = signToken(user.id, user.role, user.employeeRole);
  res.status(201).json(LoginUserResponse.parse({ user: buildUserOut(user), token }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { identifier, password } = parsed.data;

  const isEmail = identifier.includes("@");
  const [user] = await db.select().from(usersTable).where(
    isEmail ? eq(usersTable.email, identifier) : eq(usersTable.phone, identifier)
  );

  if (!user) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const token = signToken(user.id, user.role, user.employeeRole);
  res.json(LoginUserResponse.parse({ user: buildUserOut(user), token }));
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "تم تسجيل الخروج" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;
  res.json(GetCurrentUserResponse.parse(buildUserOut(user)));
});

router.put("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const { name, phone, address, area } = req.body as {
    name?: string; phone?: string; address?: string; area?: string;
  };
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name     !== undefined) updates.name    = name.trim();
  if (phone    !== undefined) updates.phone   = phone.trim() || null;
  if (address  !== undefined) updates.address = address.trim() || null;
  if (area     !== undefined) updates.area    = area.trim() || null;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "لا توجد بيانات للتحديث" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, authReq.user.id))
    .returning();

  res.json(buildUserOut(updated));
});

export default router;
