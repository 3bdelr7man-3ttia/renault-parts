import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";
import { CreateReviewBody } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/reviews", requireAuth, async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.rating < 1 || parsed.data.rating > 5) {
    res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      orderId: parsed.data.orderId,
      userId: authReq.user.id,
      workshopId: parsed.data.workshopId ?? null,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .returning();

  res.status(201).json({
    id: review.id,
    orderId: review.orderId,
    userId: review.userId,
    workshopId: review.workshopId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  });
});

export default router;
