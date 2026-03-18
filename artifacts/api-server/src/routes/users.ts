import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateUserBody, UpdateUserParams, UpdateUserResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router: IRouter = Router();

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const authReq = req as AuthenticatedRequest;
  if (authReq.user.id !== params.data.id && authReq.user.role !== "admin") {
    res.status(403).json({ error: "غير مصرح لك بتعديل هذا الحساب" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({
      name: parsed.data.name,
      phone: parsed.data.phone,
      carModel: parsed.data.carModel,
      carYear: parsed.data.carYear,
      address: parsed.data.address,
      area: parsed.data.area,
    })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  const userOut = {
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    carModel: updated.carModel,
    carYear: updated.carYear,
    address: updated.address,
    area: updated.area,
    role: updated.role,
    createdAt: updated.createdAt,
  };

  res.json(UpdateUserResponse.parse(userOut));
});

export default router;
