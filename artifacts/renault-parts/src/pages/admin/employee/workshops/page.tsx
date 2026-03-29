import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";
import { Building2, ClipboardCheck, Loader2, MapPinned, Plus, Wrench, X } from "lucide-react";

type SalesWorkshop = {
  id: number;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  address?: string | null;
  source: string;
  status: string;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
  convertedWorkshopId?: number | null;
  ownershipSource?: "self_created" | "assigned";
};

type WorkshopFormState = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  nextFollowUpAt: string;
  notes: string;
};

const emptyWorkshopForm: WorkshopFormState = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  area: "",
  address: "",
  nextFollowUpAt: "",
  notes: "",
};

function ownershipMeta(source?: "self_created" | "assigned") {
  if (source === "self_created") {
    return { label: "أدخلتها بنفسك", className: `${adminUi.badgeBase} ${adminSemantic.success}` };
  }
  return { label: "مسندة إليك", className: `${adminUi.badgeBase} ${adminSemantic.info}` };
}

export default function EmployeeWorkshopsPage() {
  const { token, hasPermission } = useAuth();
  const { toast } = useToast();

  const [data, setData] = React.useState<SalesWorkshop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<WorkshopFormState>(emptyWorkshopForm);

  const canCreate = hasPermission("sales.workshops.create_own");
  const selfCreatedCount = data.filter((item) => item.ownershipSource === "self_created").length;
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const loadWorkshops = React.useCallback(async () => {
    if (!token) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/sales/workshops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "تعذر تحميل الورش الآن.");
      }
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      setData([]);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل الورش الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  const handleCreate = async () => {
    if (!form.name || !form.phone || !form.area) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "اسم الورشة والهاتف والمنطقة مطلوبة." });
      return;
    }

    setSaving(true);
    try {
      if (!token) {
        throw new Error("انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى.");
      }

      const response = await fetch(`${base}/api/admin/employee/sales/workshops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          nextFollowUpAt: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "فشل إضافة الورشة");
      }

      toast({ title: "تمت إضافة الورشة", description: "الورشة الجديدة أصبحت ضمن قائمة متابعتك." });
      setShowAdd(false);
      setForm(emptyWorkshopForm);
      await loadWorkshops();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إضافة الورشة",
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
            <p className="text-[#C8974A] text-sm font-bold mb-2">ورش المتابعة</p>
            <h1 className={adminUi.title}>الورش المسندة لموظف المبيعات</h1>
            <p className={`${adminUi.subtitle} max-w-3xl`}>
              هذه الصفحة تعرض فقط الورش التي يتابعها هذا الموظف، سواء كانت ورشًا جديدة أو حالات دخلت مرحلة التفاوض أو التحويل.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAdd(true)}
              className={adminUi.primaryButton}
            >
              <Plus className="w-4 h-4" />
              إضافة ورشة
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={adminUi.statCard}>
          <Building2 className="w-5 h-5 text-[#C8974A] mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">إجمالي الورش</p>
          <p className="text-slate-950 font-black text-2xl">{data.length}</p>
        </div>
        <div className={adminUi.statCard}>
          <MapPinned className="w-5 h-5 text-sky-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">متابعات قادمة</p>
          <p className="text-slate-950 font-black text-2xl">{data.filter((item) => item.nextFollowUpAt).length}</p>
        </div>
        <div className={adminUi.statCard}>
          <ClipboardCheck className="w-5 h-5 text-emerald-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">تحويلات</p>
          <p className="text-slate-950 font-black text-2xl">{data.filter((item) => item.convertedWorkshopId).length}</p>
        </div>
        <div className={adminUi.statCard}>
          <Wrench className="w-5 h-5 text-violet-600 mb-4" />
          <p className="text-slate-500 text-xs font-bold mb-2">أضفتها بنفسك</p>
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
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-slate-950 font-black text-xl mb-3">لا توجد ورش مسندة بعد</h3>
            <p className="text-slate-500 text-sm">يمكنك بدء إضافة ورش بنفسك أو انتظار الحالات المسندة من الإدارة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={adminUi.tableHead}>
                  <th className="px-4 py-3 text-right">الورشة</th>
                  <th className="px-4 py-3 text-right">المسؤول</th>
                  <th className="px-4 py-3 text-right">التواصل</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الملكية</th>
                  <th className="px-4 py-3 text-right">آخر تواصل</th>
                  <th className="px-4 py-3 text-right">المتابعة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((workshop) => {
                  const ownership = ownershipMeta(workshop.ownershipSource);
                  return (
                    <tr key={workshop.id} className={`${adminUi.tableRow} align-top`}>
                      <td className="py-4 pr-0 pl-4">
                        <p className="text-slate-950 font-bold">{workshop.name}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {workshop.area ?? "بدون منطقة"} {workshop.address ? `· ${workshop.address}` : ""}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-slate-700">{workshop.contactPerson ?? "—"}</td>
                      <td className="py-4 px-4">
                        <p className="text-slate-700" dir="ltr">{workshop.phone}</p>
                        {workshop.email && <p className="text-slate-500 text-xs mt-1">{workshop.email}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`${adminUi.badgeBase} ${adminSemantic.warning}`}>
                          {workshop.status}
                        </span>
                        {workshop.convertedWorkshopId && <p className="text-emerald-600 text-xs mt-2">مرتبطة بورشة #{workshop.convertedWorkshopId}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={ownership.className}>
                          {ownership.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">{workshop.lastContactAt ? new Date(workshop.lastContactAt).toLocaleString("ar-EG") : "—"}</td>
                      <td className="py-4 px-4 text-slate-500 text-xs">{workshop.nextFollowUpAt ? new Date(workshop.nextFollowUpAt).toLocaleString("ar-EG") : "—"}</td>
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
                <h2 className="text-slate-950 text-2xl font-black">إضافة ورشة جديدة</h2>
                <p className="text-slate-500 text-sm mt-1">الورشة ستسجل ضمن فرص المتابعة الخاصة بك مباشرة.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
              <input className={adminUi.input} placeholder="اسم الورشة" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className={adminUi.input} placeholder="اسم المسؤول" value={form.contactPerson} onChange={(e) => setForm((prev) => ({ ...prev, contactPerson: e.target.value }))} />
              <input className={adminUi.input} placeholder="رقم الهاتف" dir="ltr" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className={adminUi.input} placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input className={adminUi.input} placeholder="المنطقة" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              <div className="md:col-span-2">
                <input className={adminUi.input} placeholder="العنوان" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-500 text-xs font-bold mb-2">المتابعة القادمة</label>
                <input className={adminUi.input} type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => setForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))} />
              </div>
              <textarea className={`md:col-span-2 min-h-[120px] ${adminUi.textarea} resize-none`} placeholder="ملاحظات أولية عن حالة الورشة أو وضع التفاوض" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className={adminUi.modalFooter}>
              <button onClick={() => setShowAdd(false)} className={`${adminUi.secondaryButton} flex-1 justify-center`}>
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className={`${adminUi.primaryButton} flex-1 justify-center`}>
                {saving ? "جارٍ الحفظ..." : "حفظ الورشة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
