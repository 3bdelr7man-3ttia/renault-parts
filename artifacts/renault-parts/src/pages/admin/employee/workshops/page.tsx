import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
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
    return { label: "أدخلتها بنفسك", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" };
  }
  return { label: "مسندة إليك", className: "bg-sky-500/10 text-sky-300 border-sky-500/20" };
}

export default function EmployeeWorkshopsPage() {
  const { getAuthHeaders, hasPermission } = useAuth();
  const { toast } = useToast();
  const headers = getAuthHeaders().headers ?? {};

  const [data, setData] = React.useState<SalesWorkshop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<WorkshopFormState>(emptyWorkshopForm);

  const canCreate = hasPermission("sales.workshops.create_own");
  const selfCreatedCount = data.filter((item) => item.ownershipSource === "self_created").length;

  const loadWorkshops = React.useCallback(async () => {
    setLoading(true);
    try {
      const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
      const response = await fetch(`${base}/api/admin/employee/sales/workshops`, { headers });
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch {
      setData([]);
      toast({ variant: "destructive", title: "خطأ", description: "تعذر تحميل الورش الآن." });
    } finally {
      setLoading(false);
    }
  }, [headers, toast]);

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
      const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
      const response = await fetch(`${base}/api/admin/employee/sales/workshops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
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
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#F9E795] text-sm font-bold mb-2">ورش المتابعة</p>
            <h1 className="text-3xl font-black text-white mb-3">الورش المسندة لموظف المبيعات</h1>
            <p className="text-white/60 text-sm leading-7 max-w-3xl">
              هذه الصفحة تعرض فقط الورش التي يتابعها هذا الموظف، سواء كانت ورشًا جديدة أو حالات دخلت مرحلة التفاوض أو التحويل.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة ورشة
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Building2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي الورش</p>
          <p className="text-white font-black text-2xl">{data.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <MapPinned className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">متابعات قادمة</p>
          <p className="text-white font-black text-2xl">{data.filter((item) => item.nextFollowUpAt).length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <ClipboardCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">تحويلات</p>
          <p className="text-white font-black text-2xl">{data.filter((item) => item.convertedWorkshopId).length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Wrench className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">أضفتها بنفسك</p>
          <p className="text-white font-black text-2xl">{selfCreatedCount}</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F9E795]/10 text-[#F9E795] flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-white font-black text-xl mb-3">لا توجد ورش مسندة بعد</h3>
            <p className="text-white/50 text-sm">يمكنك بدء إضافة ورش بنفسك أو انتظار الحالات المسندة من الإدارة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs font-bold border-b border-white/10">
                  <th className="py-3 text-right">الورشة</th>
                  <th className="py-3 text-right">المسؤول</th>
                  <th className="py-3 text-right">التواصل</th>
                  <th className="py-3 text-right">الحالة</th>
                  <th className="py-3 text-right">الملكية</th>
                  <th className="py-3 text-right">آخر تواصل</th>
                  <th className="py-3 text-right">المتابعة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((workshop) => {
                  const ownership = ownershipMeta(workshop.ownershipSource);
                  return (
                    <tr key={workshop.id} className="border-b border-white/5 align-top">
                      <td className="py-4 pr-0 pl-4">
                        <p className="text-white font-bold">{workshop.name}</p>
                        <p className="text-white/45 text-xs mt-1">
                          {workshop.area ?? "بدون منطقة"} {workshop.address ? `· ${workshop.address}` : ""}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-white/75">{workshop.contactPerson ?? "—"}</td>
                      <td className="py-4 px-4">
                        <p className="text-white/80" dir="ltr">{workshop.phone}</p>
                        {workshop.email && <p className="text-white/45 text-xs mt-1">{workshop.email}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20">
                          {workshop.status}
                        </span>
                        {workshop.convertedWorkshopId && <p className="text-emerald-300 text-xs mt-2">مرتبطة بورشة #{workshop.convertedWorkshopId}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-2 rounded-xl text-xs font-bold border ${ownership.className}`}>
                          {ownership.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white/60 text-xs">{workshop.lastContactAt ? new Date(workshop.lastContactAt).toLocaleString("ar-EG") : "—"}</td>
                      <td className="py-4 px-4 text-white/60 text-xs">{workshop.nextFollowUpAt ? new Date(workshop.nextFollowUpAt).toLocaleString("ar-EG") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-3xl bg-[#111826] border border-white/10 rounded-3xl p-6 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black">إضافة ورشة جديدة</h2>
                <p className="text-white/45 text-sm mt-1">الورشة ستسجل ضمن فرص المتابعة الخاصة بك مباشرة.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="اسم الورشة" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="اسم المسؤول" value={form.contactPerson} onChange={(e) => setForm((prev) => ({ ...prev, contactPerson: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="رقم الهاتف" dir="ltr" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="المنطقة" value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
              <div className="md:col-span-2">
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="العنوان" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs font-bold mb-2">المتابعة القادمة</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none" type="datetime-local" value={form.nextFollowUpAt} onChange={(e) => setForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))} />
              </div>
              <textarea className="md:col-span-2 min-h-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none" placeholder="ملاحظات أولية عن حالة الورشة أو وضع التفاوض" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? "جارٍ الحفظ..." : "حفظ الورشة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
