import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { BadgeCheck, Loader2, PhoneCall, Plus, Target, Users, X } from "lucide-react";

type SalesCustomer = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  area?: string | null;
  address?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  source: string;
  status: string;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
  convertedOrderId?: number | null;
  registeredUserId?: number | null;
  ownershipSource?: "self_created" | "assigned";
};

type CustomerFormState = {
  name: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  carModel: string;
  carYear: string;
  nextFollowUpAt: string;
  notes: string;
};

const emptyCustomerForm: CustomerFormState = {
  name: "",
  phone: "",
  email: "",
  area: "",
  address: "",
  carModel: "",
  carYear: "",
  nextFollowUpAt: "",
  notes: "",
};

function ownershipMeta(source?: "self_created" | "assigned") {
  if (source === "self_created") {
    return { label: "أدخلته بنفسك", className: `${adminUi.badgeBase} ${adminSemantic.success}` };
  }
  return { label: "مسند إليك", className: `${adminUi.badgeBase} ${adminSemantic.info}` };
}

export default function EmployeeCustomersPage() {
  const { token, hasPermission } = useAuth();
  const { toast } = useToast();

  const [data, setData] = React.useState<SalesCustomer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<CustomerFormState>(emptyCustomerForm);

  const canCreate = hasPermission("sales.customers.create_own");
  const selfCreatedCount = data.filter((item) => item.ownershipSource === "self_created").length;
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const loadCustomers = React.useCallback(async () => {
    if (!token) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/sales/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل العملاء الآن.");
      }
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      setData([]);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل العملاء الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreate = async () => {
    if (!form.name || !form.phone || !form.area) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والهاتف والمنطقة مطلوبة." });
      return;
    }

    setSaving(true);
    try {
      if (!token) {
        throw new Error("انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى.");
      }

      const response = await fetch(`${base}/api/admin/employee/sales/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          carYear: form.carYear ? Number(form.carYear) : null,
          nextFollowUpAt: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "فشل إضافة العميل");
      }

      toast({ title: "تمت إضافة العميل", description: "العميل الجديد أصبح ضمن قائمتك مباشرة." });
      setShowAdd(false);
      setForm(emptyCustomerForm);
      await loadCustomers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إضافة العميل",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#C8974A] text-sm font-bold mb-2">عملائي</p>
            <h1 className={adminUi.title}>قاعدة العملاء المسندة لموظف المبيعات</h1>
            <p className={`${adminUi.subtitle} max-w-3xl`}>
              هذه الصفحة تعرض العملاء المسندين لحساب المبيعات الحالي فقط، مع حالة كل عميل وآخر تواصل وموعد المتابعة القادمة.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAdd(true)}
              className={adminUi.primaryButton}
            >
              <Plus className="w-4 h-4" />
              إضافة عميل
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={adminUi.statCard}>
          <Users className="w-5 h-5 text-[#C8974A] mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">إجمالي العملاء</p>
          <p className="text-slate-950 font-black text-2xl">{data.length}</p>
        </div>
        <div className={adminUi.statCard}>
          <PhoneCall className="w-5 h-5 text-sky-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">متابعات قريبة</p>
          <p className="text-slate-950 font-black text-2xl">{data.filter((item) => item.nextFollowUpAt).length}</p>
        </div>
        <div className={adminUi.statCard}>
          <Target className="w-5 h-5 text-emerald-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">تحويلات ناجحة</p>
          <p className="text-slate-950 font-black text-2xl">{data.filter((item) => item.convertedOrderId || item.registeredUserId).length}</p>
        </div>
        <div className={adminUi.statCard}>
          <BadgeCheck className="w-5 h-5 text-violet-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">أضفتهم بنفسك</p>
          <p className="text-slate-950 font-black text-2xl">{selfCreatedCount}</p>
        </div>
      </div>

      <div className={adminUi.tableShell}>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#C8974A] animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className={adminUi.emptyState}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C8974A]/10 text-[#C8974A] flex items-center justify-center mb-4">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <h3 className="text-slate-950 font-black text-xl mb-3">لا توجد عملاء مسندة بعد</h3>
            <p className="text-slate-500 text-sm">يمكنك البدء بإضافة عميل بنفسك أو انتظار ما يسنده لك مدير الفريق.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={adminUi.tableHead}>
                  <th className="px-4 py-3 text-right">العميل</th>
                  <th className="px-4 py-3 text-right">التواصل</th>
                  <th className="px-4 py-3 text-right">السيارة</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الملكية</th>
                  <th className="px-4 py-3 text-right">المصدر</th>
                  <th className="px-4 py-3 text-right">آخر تواصل</th>
                  <th className="px-4 py-3 text-right">المتابعة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((customer) => {
                  const ownership = ownershipMeta(customer.ownershipSource);
                  return (
                    <tr key={customer.id} className={`${adminUi.tableRow} align-top`}>
                      <td className="py-4 pr-0 pl-4">
                        <p className="text-slate-950 font-bold">{customer.name}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {customer.area ?? "بدون منطقة"} {customer.address ? `· ${customer.address}` : ""}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-700" dir="ltr">{customer.phone}</p>
                        {customer.email && <p className="text-slate-500 text-xs mt-1">{customer.email}</p>}
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        {customer.carModel ?? "—"} {customer.carYear ?? ""}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`${adminUi.badgeBase} ${adminSemantic.warning}`}>
                          {customer.status}
                        </span>
                        {customer.convertedOrderId && <p className="text-emerald-600 text-xs mt-2">تم التحويل إلى طلب #{customer.convertedOrderId}</p>}
                        {!customer.convertedOrderId && customer.registeredUserId && (
                          <p className="text-sky-600 text-xs mt-2">تم التسجيل على المنصة كعميل #{customer.registeredUserId}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={ownership.className}>
                          {ownership.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{customer.source}</td>
                      <td className="py-4 px-4 text-slate-500 text-xs">{customer.lastContactAt ? new Date(customer.lastContactAt).toLocaleString("ar-EG") : "—"}</td>
                      <td className="py-4 px-4 text-slate-500 text-xs">{customer.nextFollowUpAt ? new Date(customer.nextFollowUpAt).toLocaleString("ar-EG") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className={adminUi.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={`${adminUi.modalPanel} max-w-3xl`} onClick={(event) => event.stopPropagation()}>
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-slate-950 text-2xl font-black">إضافة عميل جديد</h2>
                <p className="text-slate-500 text-sm mt-1">العميل سيُسجل باسمك ويظهر مباشرة ضمن قائمتك.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
              <input className={adminUi.input} placeholder="اسم العميل" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className={adminUi.input} placeholder="رقم الهاتف" dir="ltr" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className={adminUi.input} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input className={adminUi.input} placeholder="المنطقة" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              <input className={adminUi.input} placeholder="موديل السيارة" value={form.carModel} onChange={(e) => setForm((prev) => ({ ...prev, carModel: e.target.value }))} />
              <input className={adminUi.input} placeholder="سنة السيارة" type="number" value={form.carYear} onChange={(e) => setForm((prev) => ({ ...prev, carYear: e.target.value }))} />
              <input className={`md:col-span-2 ${adminUi.input}`} placeholder="العنوان" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
              <div className="md:col-span-2">
                <label className="block text-slate-500 text-xs font-bold mb-2">المتابعة القادمة</label>
                <input className={adminUi.input} type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => setForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))} />
              </div>
              <textarea className={`md:col-span-2 min-h-[120px] ${adminUi.textarea} resize-none`} placeholder="ملاحظات أولية عن العميل أو الطلب" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className={adminUi.modalFooter}>
              <button onClick={() => setShowAdd(false)} className={`${adminUi.secondaryButton} flex-1 justify-center`}>
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className={`${adminUi.primaryButton} flex-1 justify-center`}>
                {saving ? "جارٍ الحفظ..." : "حفظ العميل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
