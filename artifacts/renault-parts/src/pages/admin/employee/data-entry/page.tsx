import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Database, Loader2, Plus, Users, Wrench, X } from "lucide-react";
import { adminSemantic, adminUi } from "@/components/admin/admin-ui";

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
  notes?: string | null;
  assignedEmployeeName?: string | null;
  createdByUserName?: string | null;
  registeredUserName?: string | null;
  nextFollowUpAt?: string | null;
};

type Assignee = {
  id: number;
  name: string;
  employeeRole?: "sales" | "technical_expert" | "marketing_tech" | "manager" | null;
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
  sales: "مبيعات ومتابعة",
  technical_expert: "خبير فني",
  marketing_tech: "تسويق وتقنية",
  manager: "مدير فريق",
};

type StructuredTechnicalNote = {
  title: string;
  items: string[];
};

function parseStructuredTechnicalNote(notes?: string | null): StructuredTechnicalNote | null {
  if (!notes) return null;
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length || lines[0] !== "ملخص الرد الفني") return null;

  return {
    title: lines[0],
    items: lines.slice(1),
  };
}

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
  const technicalDecisionCount = [...customerLeads, ...workshopLeads].filter((lead) => parseStructuredTechnicalNote(lead.notes)).length;

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
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#C8974A] text-sm font-black mb-2">إدخال البيانات</p>
            <h1 className={adminUi.title}>مساحة تجهيز العملاء والورش</h1>
            <p className={`${adminUi.subtitle} max-w-3xl`}>
              هذه المساحة مخصصة لإدخال العملاء والورش الجديدة، وتجهيز بياناتها، ثم تمريرها إلى المبيعات أو الخبير الفني أو مدير الفريق حسب الحالة.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className={adminUi.primaryButton}>
            <Plus className="w-4 h-4" />
            إضافة سجل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "إجمالي السجلات", value: summary?.total ?? 0, icon: Database, tone: adminSemantic.neutral },
          { label: "أضيفت اليوم", value: summary?.addedToday ?? 0, icon: Users, tone: adminSemantic.info },
          { label: "غير مسندة", value: summary?.unassigned ?? 0, icon: BadgeCheck, tone: adminSemantic.warning },
          { label: "تم تسجيلها على المنصة", value: summary?.registered ?? 0, icon: BadgeCheck, tone: adminSemantic.success },
          { label: "قرارات فنية وصلت للقطع", value: technicalDecisionCount, icon: BadgeCheck, tone: adminSemantic.brand },
        ].map((card) => (
          <div key={card.label} className={adminUi.statCard}>
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mb-2 text-xs font-black text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className={`${adminUi.card} flex justify-center p-10`}>
          <Loader2 className="h-8 w-8 animate-spin text-[#C8974A]" />
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.label} className={adminUi.card}>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${section.label.includes("ورش") ? adminSemantic.info : adminSemantic.brand}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-950">{section.label}</h2>
            </div>
            <div className="space-y-4">
              {section.rows.map((lead) => (
                <div
                  key={lead.id}
                  className={`rounded-[24px] border p-5 ${
                    lead.type === "workshop"
                      ? "border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.58))]"
                      : "border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,251,235,0.6))]"
                  }`}
                >
                  {(() => {
                    const structuredNote = parseStructuredTechnicalNote(lead.notes);
                    return (
                      <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-black text-slate-950">{lead.name}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {lead.area ?? "بدون منطقة"} · {lead.phone} {lead.email ? `· ${lead.email}` : ""}
                      </p>
                      {lead.contactPerson && <p className="mt-1 text-xs text-slate-400">المسؤول: {lead.contactPerson}</p>}
                    </div>
                    <div className="space-y-2 text-sm text-slate-500">
                      <p>الحالة: <span className="font-bold text-[#9a6e2e]">{lead.status}</span></p>
                      <p>المسند إليه: <span className="font-semibold text-slate-800">{lead.assignedEmployeeName ?? "غير مسند"}</span></p>
                      <p>أُضيف بواسطة: <span className="font-semibold text-slate-800">{lead.createdByUserName ?? "—"}</span></p>
                      {lead.registeredUserName && <p>العميل المسجل: <span className="font-semibold text-emerald-700">{lead.registeredUserName}</span></p>}
                    </div>
                  </div>
                  {structuredNote ? (
                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(249,248,255,0.62),rgba(255,255,255,0.99))] p-4">
                      <div>
                        <p className="text-xs font-black text-[#9a6e2e]">قرار فني وصل لمسؤول القطع/الداتا</p>
                        <p className="mt-1 text-xs text-slate-500">
                          هذا الرد قادم من الخبير الفني، ويحتاج منك تنفيذ القرار أو تجهيز القطعة أو مراجعة المرتجع.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {structuredNote.items.map((line) => (
                          <div key={line} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                            {line.replace(/^- /, "")}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : lead.notes ? (
                    <p className="mt-4 text-sm leading-7 text-slate-600">{lead.notes}</p>
                  ) : null}
                      </>
                    );
                  })()}
                </div>
              ))}
              {section.rows.length === 0 && <p className="py-8 text-center text-sm text-slate-500">لا توجد عناصر في هذا القسم الآن.</p>}
            </div>
          </div>
        ))
      )}

      {showAdd && (
        <div className={adminUi.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={`${adminUi.modalPanel} max-w-3xl`} onClick={(event) => event.stopPropagation()}>
            <div className={adminUi.modalHeader}>
              <div>
                <h2 className="text-2xl font-black text-slate-950">إضافة سجل جديد</h2>
                <p className="mt-1 text-sm text-slate-500">سجل عميلًا أو ورشة، وحدد إن كنت تريد إسناده مباشرة.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className={`${adminUi.softButton} h-11 w-11 justify-center p-0`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as LeadFormState["type"] }))}
                className={adminUi.select}
              >
                <option value="customer">عميل</option>
                <option value="workshop">ورشة</option>
              </select>

              <select
                value={form.assignedEmployeeId}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedEmployeeId: event.target.value }))}
                className={adminUi.select}
              >
                <option value="">بدون إسناد</option>
                {assignees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.employeeRole ? `· ${employeeRoleLabels[employee.employeeRole]}` : ""}
                  </option>
                ))}
              </select>

              <input className={adminUi.input} placeholder={form.type === "customer" ? "اسم العميل" : "اسم الورشة"} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              <input className={adminUi.input} placeholder="رقم الهاتف" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              <input className={adminUi.input} placeholder="البريد الإلكتروني" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              <input className={adminUi.input} placeholder="المنطقة" value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} />
              <input className={`${adminUi.input} md:col-span-2`} placeholder="العنوان" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />

              {form.type === "customer" ? (
                <>
                  <input className={adminUi.input} placeholder="موديل السيارة" value={form.carModel} onChange={(event) => setForm((prev) => ({ ...prev, carModel: event.target.value }))} />
                  <input className={adminUi.input} placeholder="سنة السيارة" value={form.carYear} onChange={(event) => setForm((prev) => ({ ...prev, carYear: event.target.value }))} />
                </>
              ) : (
                <>
                  <input className={`${adminUi.input} md:col-span-2`} placeholder="الشخص المسؤول داخل الورشة" value={form.contactPerson} onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))} />
                </>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-500">موعد المتابعة القادم</label>
                <input className={adminUi.input} type="datetime-local" value={form.nextFollowUpAt} onChange={(event) => setForm((prev) => ({ ...prev, nextFollowUpAt: event.target.value }))} />
              </div>

              <textarea className={`${adminUi.textarea} md:col-span-2 min-h-[120px] resize-none`} placeholder="ملاحظات" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>

            <div className={adminUi.modalFooter}>
              <button onClick={() => setShowAdd(false)} className={`${adminUi.secondaryButton} flex-1 justify-center`}>
                إلغاء
              </button>
              <button onClick={handleCreate} disabled={saving} className={`${adminUi.primaryButton} flex-1 justify-center disabled:translate-y-0`}>
                {saving ? "جارٍ الحفظ..." : "حفظ السجل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
