import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  GetCurrentUserResponse,
} from "@workspace/api-zod";
import { hashPassword, comparePassword, signToken, requireAuth, type AuthenticatedRequest } from "../lib/auth";

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
    role: user.role,
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

  const conditions = [eq(usersTable.phone, phone)];
  if (email) {
    conditions.push(eq(usersTable.email, email));
  }
  const [existing] = await db.select().from(usersTable).where(or(...conditions));
  if (existing) {
    res.status(409).json({ error: "رقم الهاتف أو البريد الإلكتروني مسجل بالفعل" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(usersTable).values({
    name,
    phone,
    email: email ?? null,
    passwordHash,
    carModel: carModel ?? null,
    carYear: carYear ?? null,
    address: address ?? null,
    area: area ?? null,
    role: "customer",
  }).returning();

  const token = signToken(user.id);
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

  const token = signToken(user.id);
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

export default router;
