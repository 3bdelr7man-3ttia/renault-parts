# RenoPack Staging Workflow

هذا الملف يثبت خطوات تجهيز `staging` بحيث لا نعتمد على إصلاحات يدوية داخل قاعدة البيانات أو Coolify.

## 1. المتطلبات

- `DATABASE_URL` لقاعدة `staging`
- `JWT_SECRET` للـ API
- ربط GitHub source داخل Coolify على الفرع المطلوب

## 2. تجهيز قاعدة البيانات

من جذر المشروع:

```bash
pnpm install --no-frozen-lockfile
pnpm staging:prepare
```

هذا الأمر يشغل خطوتين بالترتيب:

1. `drizzle-kit push`
2. `scripts/src/seed.ts`

وبالتالي أي عمود جديد مثل `employee_role` أو أي بيانات تجريبية أساسية سيتم تطبيقها من الكود نفسه.

## 3. بيانات الـ staging الجاهزة

بعد `pnpm staging:prepare` تصبح هذه الحسابات جاهزة:

- `admin@renaultparts.eg` / `admin123`
- `customer@renaultparts.eg` / `customer123`
- `workshop@renaultparts.eg` / `workshop123`
- `sales@renaultparts.eg` / `sales123`
- `dataentry@renaultparts.eg` / `dataentry123`
- `support@renaultparts.eg` / `support123`
- `manager@renaultparts.eg` / `manager123`

كما يتم تجهيز:

- الباكدجات
- القطع
- ربط القطع بالباكدجات
- الورش
- تسعير الورشة
- طلبات ومواعيد وتقييمات تجريبية
- طلب انضمام ورشة
- مصروف تشغيلي تجريبي

## 4. Coolify

### API

- Build command:

```bash
pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server build
```

- Start command:

```bash
node artifacts/api-server/dist/index.cjs
```

- Health check path:

```bash
/api/healthz
```

### Web

- Build command:

```bash
pnpm install --no-frozen-lockfile && pnpm --filter @workspace/renault-parts build
```

- إذا كان النشر كتطبيق static داخل Coolify:
  - Publish directory: `artifacts/renault-parts/dist/public`

- إذا كان النشر كتطبيق Node preview:

```bash
pnpm --filter @workspace/renault-parts serve
```

## 5. ترتيب العمل اليومي

1. تعديل الكود محليًا
2. `pnpm run typecheck` أو الحد الأدنى الخاص بالحزمة المتأثرة
3. Push إلى GitHub
4. Coolify يعيد النشر على `staging`
5. عند تغييرات schema أو seed:

```bash
pnpm staging:prepare
```

6. تجربة الحسابات واللوحات

## 6. قبل production

- عدم استخدام `staging` كقاعدة الإنتاج نفسها قبل النسخ الاحتياطي
- تثبيت `DATABASE_URL` منفصلة للإنتاج
- تشغيل `pnpm staging:prepare` على بيئة production فقط بعد مراجعة البيانات المراد إضافتها
- ربط الدومين النهائي بعد اعتماد الشاشات والتدفقات
