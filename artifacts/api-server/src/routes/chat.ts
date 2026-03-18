import { Router, type IRouter } from "express";
import { db, chatSessionsTable, packagesTable, partsTable, packagePartsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SendChatMessageBody } from "@workspace/api-zod";
import { optionalAuth, type OptionalAuthRequest } from "../lib/auth";
import OpenAI from "openai";
import crypto from "crypto";

const router: IRouter = Router();

const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || "dummy",
});

const DEEPSEEK_MODEL = "deepseek/deepseek-chat-v3-0324";

async function buildPackagesInfo(): Promise<string> {
  const packages = await db.select().from(packagesTable);
  const lines: string[] = ["الباكدجات المتاحة في منصة رينو بارتس الإسكندرية:\n"];

  for (const pkg of packages) {
    const parts = await db
      .select({ part: partsTable })
      .from(packagePartsTable)
      .innerJoin(partsTable, eq(packagePartsTable.partId, partsTable.id))
      .where(eq(packagePartsTable.packageId, pkg.id));

    const partNames = parts.map((p) => p.part.name).join("، ");
    lines.push(
      `• ${pkg.name} (slug: ${pkg.slug})` +
      ` — السعر: ${Number(pkg.sellPrice).toLocaleString("ar-EG")} جنيه` +
      ` — ضمان: ${pkg.warrantyMonths} شهور` +
      (pkg.kmService ? ` — عند: ${pkg.kmService.toLocaleString("ar-EG")} كم` : "") +
      (partNames ? `\n  يشمل: ${partNames}` : "")
    );
  }

  lines.push(`
الخدمات المشمولة مع كل الباكدجات:
- التركيب المجاني عبر شبكة ورش شريكة في الإسكندرية
- الضمان على كل القطع
- توصيل لحد البيت أو لأقرب مركز صيانة شريك
- إمكانية اختيار القطع (أصلي / بديل تركي / بديل صيني)

مناطق الخدمة: العجمي، سيدي بشر، السيوف، المنتزه، العصافرة، سموحة، كليوباترا، محطة الرمل`);

  return lines.join("\n");
}

router.post("/chat", optionalAuth, async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId, carModel, carYear, mileage } = parsed.data;
  const authReq = req as OptionalAuthRequest;
  const userId = authReq.user?.id ?? null;

  const sessionKey = sessionId || crypto.randomUUID();

  let session = null;
  if (sessionId) {
    const [existing] = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.sessionKey, sessionId));

    if (existing) {
      if (existing.userId !== null && existing.userId !== userId) {
        res.status(403).json({ error: "غير مصرح بالوصول لهذه المحادثة" });
        return;
      }
      session = existing;
    }
  }

  const history: Array<{ role: "user" | "assistant"; content: string }> = session
    ? (session.messages as Array<{ role: "user" | "assistant"; content: string }>)
    : [];

  const userContext = [
    carModel ? `موديل السيارة: ${carModel}` : "",
    carYear ? `سنة الصنع: ${carYear}` : "",
    mileage ? `عداد الكيلومترات: ${mileage.toLocaleString("ar-EG")} كم` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const packagesInfo = await buildPackagesInfo();

  const systemPrompt = `أنت مساعد صيانة سيارات رينو في الإسكندرية، مصر. اسمك "رينو مساعد".
مهمتك الأساسية هي مساعدة العملاء في اختيار باكدج الصيانة المناسب لسيارتهم.

${packagesInfo}

قواعد التواصل:
- تكلم بالعربية دائماً (عربي مصري بسيط أو فصحى بسيطة)
- كن ودوداً ومهنياً وإيجابياً
- اسأل عن موديل السيارة وسنة الصنع وعدد الكيلومترات إذا لم تعرفها
- اقترح الباكدج المناسب بوضوح مع شرح مختصر لسبب اختيارك
- لو السؤال مش عن صيانة رينو أو السيارات، وجّه العميل بأدب

عند اقتراح باكدج بشكل واضح ومحدد، ضع هذا المعرف في نهاية ردك بالضبط: [PACKAGE_SLUG: <slug>]
مثال: [PACKAGE_SLUG: pkg-40k]

أسلاق الباكدجات المتاحة:
- pkg-20k → صيانة 20,000 كم
- pkg-40k → صيانة 40,000 كم
- pkg-60k → صيانة 60,000 كم
- pkg-100k → صيانة 100,000 كم
- emergency → باكدج الطوارئ${userContext ? `\n\nبيانات العميل الحالي: ${userContext}` : ""}`;

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let fullReply = "";

  try {
    const stream = await openrouter.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 500,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullReply += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (err) {
    console.error("DeepSeek streaming error:", err);
    fullReply = "عذراً، البوت مش متاح دلوقتي. جرب بعد شوية أو تواصل معنا مباشرة.";
    res.write(`data: ${JSON.stringify({ content: fullReply })}\n\n`);
  }

  const slugMatch = fullReply.match(/\[PACKAGE_SLUG:\s*([^\]]+)\]/);
  let suggestedPackageSlug: string | null = null;
  let suggestedPackageName: string | null = null;
  let cleanReply = fullReply;

  if (slugMatch) {
    suggestedPackageSlug = slugMatch[1].trim();
    cleanReply = fullReply.replace(/\[PACKAGE_SLUG:[^\]]+\]/g, "").trim();
    const [pkg] = await db
      .select()
      .from(packagesTable)
      .where(eq(packagesTable.slug, suggestedPackageSlug));
    if (pkg) suggestedPackageName = pkg.name;
  }

  const updatedMessages = [
    ...history,
    { role: "user", content: message },
    { role: "assistant", content: cleanReply },
  ];

  if (session) {
    await db
      .update(chatSessionsTable)
      .set({ messages: updatedMessages, updatedAt: new Date() })
      .where(eq(chatSessionsTable.sessionKey, sessionKey));
  } else {
    await db.insert(chatSessionsTable).values({
      sessionKey,
      userId,
      messages: updatedMessages,
    });
  }

  res.write(
    `data: ${JSON.stringify({
      done: true,
      sessionId: sessionKey,
      suggestedPackageSlug,
      suggestedPackageName,
    })}\n\n`
  );
  res.end();
});

export default router;
