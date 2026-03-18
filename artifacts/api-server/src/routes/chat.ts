import { Router, type IRouter } from "express";
import { db, chatSessionsTable, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

const PACKAGES_INFO = `
الباكدجات المتاحة في منصة رينو بارتس الإسكندرية:

1. باكدج 20,000 كم (صيانة عادية) - السعر: 1,040 جنيه - ضمان: 3 شهور
   يشمل: فلتر زيت + فلتر هواء + زيت محرك
   مناسب لـ: كل 20,000 كيلومتر أو كل سنة

2. باكدج 40,000 كم (صيانة متوسطة) - السعر: 1,950 جنيه - ضمان: 6 شهور
   يشمل: فلتر زيت + فلتر هواء + زيت محرك + فلتر بنزين + شمعات إشعال
   مناسب لـ: كل 40,000 كيلومتر

3. باكدج 60,000 كم (صيانة شاملة) - السعر: 3,750 جنيه - ضمان: 9 شهور
   يشمل: كل باكدج 40,000 + سير كاتينة + فلتر مكيف + زيت فرامل
   مناسب لـ: كل 60,000 كيلومتر

4. باكدج 100,000 كم (صيانة كبرى) - السعر: 7,500 جنيه - ضمان: 12 شهر
   يشمل: كل باكدج 60,000 + ديسكات فرامل + تيل فرامل + مساعدين
   مناسب لـ: كل 100,000 كيلومتر أو عند الإحساس بمشاكل في الفرامل والتعليق

5. باكدج الطوارئ - السعر: 3,250 جنيه - ضمان: 6 شهور
   يشمل: بطارية جديدة + إطار احتياطي + كشافات جديدة
   مناسب لـ: الأعطال الطارئة والاستعداد لرحلات طويلة

الخدمات المشمولة مع كل الباكدجات:
- التركيب المجاني عبر شبكة ورش شريكة في الإسكندرية
- الضمان على كل القطع
- توصيل لحد البيت أو لأقرب مركز صيانة شريك
- إمكانية اختيار القطع (أصلي / بديل تركي / بديل صيني)

مناطق الخدمة: العجمي، سيدي بشر، السيوف، المنتزه، العصافرة، سموحة، كليوباترا، محطة الرمل
`;

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId, carModel, carYear, mileage } = parsed.data;

  let sessionKey = sessionId || crypto.randomUUID();

  let session = null;
  if (sessionId) {
    const [existing] = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.sessionKey, sessionId));
    session = existing || null;
  }

  const messages: Array<{ role: string; content: string }> = session
    ? (session.messages as Array<{ role: string; content: string }>)
    : [];

  const userContext = [
    carModel ? `موديل السيارة: ${carModel}` : "",
    carYear ? `سنة الصنع: ${carYear}` : "",
    mileage ? `عداد الكيلومترات: ${mileage.toLocaleString("ar-EG")} كم` : "",
  ].filter(Boolean).join(" | ");

  const systemPrompt = `أنت مساعد صيانة سيارات رينو في الإسكندرية، مصر. اسمك "رينو مساعد".
مهمتك الأساسية هي مساعدة العملاء في اختيار باكدج الصيانة المناسب لسيارتهم.

${PACKAGES_INFO}

قواعد التواصل:
- تكلم بالعربية دائماً (عربي مصري بسيط أو فصحى بسيطة)
- كن ودوداً ومهنياً
- اسأل عن موديل السيارة، سنة الصنع، وعدد الكيلومترات إذا لم تعرفها
- اقترح الباكدج المناسب بوضوح مع شرح سبب اختيارك
- عند اقتراح باكدج، اذكر slug الباكدج بهذا الشكل: [PACKAGE_SLUG: pkg-20k] أو [PACKAGE_SLUG: pkg-40k] أو [PACKAGE_SLUG: pkg-60k] أو [PACKAGE_SLUG: pkg-100k] أو [PACKAGE_SLUG: emergency]
${userContext ? `\nمعلومات عن سيارة العميل: ${userContext}` : ""}`;

  messages.push({ role: "user", content: message });

  let reply = "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.";
  let suggestedPackageSlug: string | null = null;
  let suggestedPackageName: string | null = null;

  try {
    const openaiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_API_KEY
      ? "https://api.deepseek.com/v1"
      : "https://api.openai.com/v1";

    if (openaiKey) {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        reply = data.choices[0]?.message?.content || reply;
      }
    } else {
      const lowerMsg = message.toLowerCase();
      const allPackages = await db.select().from(packagesTable).orderBy(packagesTable.kmService);

      if (lowerMsg.includes("20") || lowerMsg.includes("زيت") || lowerMsg.includes("عادية")) {
        const pkg = allPackages.find((p) => p.slug === "pkg-20k");
        if (pkg) {
          reply = `بناءً على احتياجك، أنصحك بـ ${pkg.name} بسعر ${Number(pkg.sellPrice).toLocaleString("ar-EG")} جنيه. يشمل التغيير الدوري للزيت والفلاتر مع ضمان ${pkg.warrantyMonths} شهور. [PACKAGE_SLUG: ${pkg.slug}]`;
          suggestedPackageSlug = pkg.slug;
          suggestedPackageName = pkg.name;
        }
      } else if (lowerMsg.includes("100") || lowerMsg.includes("كبرى") || lowerMsg.includes("فرامل")) {
        const pkg = allPackages.find((p) => p.slug === "pkg-100k");
        if (pkg) {
          reply = `للصيانة الكبرى أو مشاكل الفرامل، أنصحك بـ ${pkg.name} بسعر ${Number(pkg.sellPrice).toLocaleString("ar-EG")} جنيه مع ضمان سنة كاملة. [PACKAGE_SLUG: ${pkg.slug}]`;
          suggestedPackageSlug = pkg.slug;
          suggestedPackageName = pkg.name;
        }
      } else if (lowerMsg.includes("طوارئ") || lowerMsg.includes("بطارية") || lowerMsg.includes("إطار")) {
        const pkg = allPackages.find((p) => p.slug === "emergency");
        if (pkg) {
          reply = `لحالات الطوارئ، لدينا ${pkg.name} بسعر ${Number(pkg.sellPrice).toLocaleString("ar-EG")} جنيه يشمل بطارية جديدة وإطار احتياطي وكشافات. [PACKAGE_SLUG: ${pkg.slug}]`;
          suggestedPackageSlug = pkg.slug;
          suggestedPackageName = pkg.name;
        }
      } else {
        reply = `أهلاً! أنا مساعد صيانة رينو في الإسكندرية. عندنا ${allPackages.length} باكدجات صيانة تبدأ من 1,040 جنيه. محتاج أعرف موديل سيارتك وعداد الكيلومترات عشان أنصحك بالباكدج المناسب.`;
      }
    }
  } catch (err) {
    console.error("Chat error:", err);
  }

  const slugMatch = reply.match(/\[PACKAGE_SLUG:\s*([^\]]+)\]/);
  if (slugMatch) {
    suggestedPackageSlug = slugMatch[1].trim();
    reply = reply.replace(/\[PACKAGE_SLUG:[^\]]+\]/, "").trim();
    const allPackages = await db.select().from(packagesTable);
    const pkg = allPackages.find((p) => p.slug === suggestedPackageSlug);
    if (pkg) suggestedPackageName = pkg.name;
  }

  messages.push({ role: "assistant", content: reply });

  if (session) {
    await db
      .update(chatSessionsTable)
      .set({ messages, updatedAt: new Date() })
      .where(eq(chatSessionsTable.sessionKey, sessionKey));
  } else {
    await db.insert(chatSessionsTable).values({
      sessionKey,
      messages,
    });
  }

  res.json(SendChatMessageResponse.parse({
    reply,
    sessionId: sessionKey,
    suggestedPackageSlug,
    suggestedPackageName,
  }));
});

export default router;
