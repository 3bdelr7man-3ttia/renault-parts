import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Database, Loader2, Plus, Users, Wrench, X } from "lucide-react";

type DataEntrySummary = {
  total: number;
  unassigned: number;
  registered: number;
  addedToday: number;
};

type DataEntryLead = {
  id: number;
  type: "customer" | "workshop";
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  area?: string | null;
  source: string;
  status: string;
  assignedEmployeeName?: string | null;
  createdByUserName?: string | null;
  registeredUserName?: string | null;
  nextFollowUpAt?: string | null;
};

type Assignee = {
  id: number;
  name: string;
  employeeRole?: "sales" | "customer_service" | "manager" | null;
};

type LeadFormState = {
  type: "customer" | "workshop";
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  carModel: string;
  carYear: string;
  nextFollowUpAt: string;
  notes: string;
  assignedEmployeeId: string;
};

const emptyForm: LeadFormState = {
  type: "customer",
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  area: "",
  address: "",
  carModel: "",
  carYear: "",
  nextFollowUpAt: "",
  notes: "",
  assignedEmployeeId: "",
};

const employeeRoleLabels: Record<NonNullable<Assignee["employeeRole"]>, string> = {
  sales: "مبيعات",
  customer_service: "خدمة العملاء",
  manager: "مدير فريق",
};

export default function EmployeeDataEntryPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [summary, setSummary] = React.useState<DataEntrySummary | null>(null);
  const [customerLeads, setCustomerLeads] = React.useState<DataEntryLead[]>([]);
  const [workshopLeads, setWorkshopLeads] = React.useState<DataEntryLead[]>([]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [form, setForm] = React.useState<LeadFormState>(emptyForm);

  const loadPage = React.useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryResponse, customersResponse, workshopsResponse, assigneesResponse] = await Promise.all([
        fetch(`${base}/api/admin/employee/data-entry/summary`, { headers }),
        fetch(`${base}/api/admin/employee/data-entry/leads?type=customer`, { headers }),
        fetch(`${base}/api/admin/employee/data-entry/leads?type=workshop`, { headers }),
        fetch(`${base}/api/admin/employee/data-entry/assignees`, { headers }),
      ]);

      const [summaryResult, customersResult, workshopsResult, assigneesResult] = await Promise.all([
        summaryResponse.json().catch(() => null),
        customersResponse.json().catch(() => null),
        workshopsResponse.json().catch(() => null),
        assigneesResponse.json().catch(() => null),
      ]);

      if (!summaryResponse.ok || !customersResponse.ok || !workshopsResponse.ok || !assigneesResponse.ok) {
        throw new Error(
          summaryResult?.error ||
            customersResult?.error ||
            workshopsResult?.error ||
            assigneesResult?.error ||
            "تعذر تحميل مساحة إدخال البيانات الآن.",
        );
      }

      setSummary(summaryResult);
      setCustomerLeads(Array.isArray(customersResult) ? customersResult : []);
      setWorkshopLeads(Array.isArray(workshopsResult) ? workshopsResult : []);
      setAssignees(Array.isArray(assigneesResult) ? assigneesResult : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "تعذر تحميل مساحة إدخال البيانات الآن.",
      });
    } finally {
      setLoading(false);
    }
  }, [base, toast, token]);

  React.useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleCreate = async () => {
    if (!token) return;
    if (!form.name || !form.phone || !form.area) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والهاتف والمنطقة مطلوبة." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${base}/api/admin/employee/data-entry/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null,
          carYear: form.carYear ? Number(form.carYear) : null,
          nextFollowUpAt: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "فشل حفظ السجل");
      }

      toast({ title: "تم حفظ السجل", description: "أصبح السجل ضمن مسار إدخال البيانات ويمكن متابعته أو إسناده." });
      setShowAdd(false);
      setForm(emptyForm);
      await loadPage();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حفظ السجل",
      });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { label: "عملاء إدخال البيانات", rows: customerLeads, icon: Users },
    { label: "ورش إدخال البيانات", rows: workshopLeads, icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#F9E795] text-sm font-bold mb-2">إدخال البيانات</p>
            <h1 className="text-3xl font-black text-white mb-3">مساحة تجهيز العملاء والورش</h1>
            <p className="text-white/60 text-sm leading-7 max-w-3xl">
              هذه المساحة مخصصة لإدخال العملاء والورش الجديدة، وتجهيز بياناتها، ثم تمريرها إلى المبيعات أو خدمة العملاء أو مدير الفريق حسب الحالة.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black text-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة سجل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Database className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي السجلات</p>
          <p className="text-white font-black text-2xl">{summary?.total ?? 0}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">أضيفت اليوم</p>
          <p className="text-white font-black text-2xl">{summary?.addedToday ?? 0}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">غير مسندة</p>
          <p className="text-white font-black text-2xl">{summary?.unassigned ?? 0}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">تم تسجيلها على المنصة</p>
          <p className="text-white font-black text-2xl">{summary?.registered ?? 0}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#151D33] border border-white/10 rounded-3xl p-10 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.label} className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
            <h2 className="text-white font-black text-xl mb-4">{section.label}</h2>
            <div className="space-y-4">
              {section.rows.map((lead) => (
                <div key={lead.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-white font-black text-lg">{lead.name}</p>
                      <p className="text-white/45 text-sm mt-2">
                        {lead.area ?? "بدون منطقة"} · {lead.phone} {lead.email ? `· ${lead.email}` : ""}
                      </p>
                      {lead.contactPerson && <p className="text-white/35 text-xs mt-1">المسؤول: {lead.contactPerson}</p>}
                    </div>
                    <div className="text-sm text-white/55 space-y-2">
                      <p>الحالة: <span className="text-[#F9E795]">{lead.status}</span></p>
                      <p>المسند إليه: <span className="text-white">{lead.assignedEmployeeName ?? "غير مسند"}</span></p>
                      <p>أُضيف بواسطة: <span className="text-white">{lead.createdByUserName ?? "—"}</span></p>
                      {lead.registeredUserName && <p>العميل المسجل: <span className="text-emerald-300">{lead.registeredUserName}</span></p>}
                    </div>
                  </div>
                </div>
              ))}
              {section.rows.length === 0 && <p className="text-white/45 text-sm text-center py-8">لا توجد عناصر في هذا القسم الآن.</p>}
            </div>
          </div>
        ))
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-3xl bg-[#111826] border border-white/10 rounded-3xl p-6 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-2xl font-black">إضافة سجل جديد</h2>
                <p className="text-white/45 text-sm mt-1">سجل عميلًا أو ورشة، وحدد إن كنت تريد إسناده مباشرة.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as LeadFormState["type"] }))}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
              >
                <option value="customer" className="bg-[#111826]">عميل</option>
                <option value="workshop" className="bg-[#111826]">ورشة</option>
              </select>

              <select
                value={form.assignedEmployeeId}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedEmployeeId: event.target.value }))}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
              >
                <option value="" className="bg-[#111826]">بدون إسناد</option>
                {assignees.map((employee) => (
                  <option key={employee.id} value={employee.id} className="bg-[#111826]">
                    {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
                  </option>
                ))}
              </select>

              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder={form.type === "customer" ? "اسم العميل" : "اسم الورشة"} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="رقم الهاتف" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="البريد الإلكتروني" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="المنطقة" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
              <input className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="العنوان" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />

              {form.type === "customer" ? (
                <>
                  <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="موديل السيارة" value={form.carModel} onChange={(event) => setForm((prev) => ({ ...prev, carModel: event.target.value }))} />
                  <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="سنة السيارة" value={form.carYear} onChange={(event) => setForm((prev) => ({ ...prev, carYear: event.target.value }))} />
                </>
              ) : (
                <>
                  <input className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none" placeholder="الشخص المسؤول داخل الورشة" value={form.contactPerson} onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))} />
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs font-bold mb-2">موعد المتابعة القادم</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none" type="datetime-local" value={form.nextFollowUpAt} onChange={(event) => setForm((prev) => ({ ...prev, nextFollowUpAt: event.target.value }))} />
              </div>

              <textarea className="md:col-span-2 min-h-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/25 outline-none resize-none" placeholder="ملاحظات" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold hover:bg-white/10 transition-all">
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#F9E795] text-[#0D1220] font-black hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? "جارٍ الحفظ..." : "حفظ السجل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
