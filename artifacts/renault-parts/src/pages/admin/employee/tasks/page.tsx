import React from "react";
import { useAuth } from "@/lib/auth-context";
import { CalendarClock, CheckSquare2, Loader2, PhoneCall } from "lucide-react";

type SalesTask = {
  id: number;
  title: string;
  taskType: string;
  area?: string | null;
  dueAt: string;
  status: string;
  result?: string | null;
  notes?: string | null;
  leadId?: number | null;
  leadName?: string | null;
  leadPhone?: string | null;
  leadType?: string | null;
};

function useSalesTasks(headers: Record<string, string>) {
  const [data, setData] = React.useState<SalesTask[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/admin/employee/sales/tasks`, { headers })
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export default function EmployeeTasksPage() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders().headers ?? {};
  const { data, loading } = useSalesTasks(headers);

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">مهامي</p>
        <h1 className="text-3xl font-black text-white mb-3">مهام موظف المبيعات اليومية</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه الصفحة تعرض قائمة المهام المفتوحة والمجدولة لهذا الموظف فقط، سواء كانت مكالمات، زيارات، أو متابعات مرتبطة بعميل أو ورشة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <CheckSquare2 className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">إجمالي المهام</p>
          <p className="text-white font-black text-2xl">{data.length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <PhoneCall className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">مهام مفتوحة</p>
          <p className="text-white font-black text-2xl">{data.filter((task) => task.status === "pending" || task.status === "in_progress").length}</p>
        </div>
        <div className="bg-[#151D33] border border-white/10 rounded-2xl p-5">
          <CalendarClock className="w-5 h-5 text-[#F9E795] mb-4" />
          <p className="text-white/40 text-xs font-bold mb-2">مرتبطة بفرص</p>
          <p className="text-white font-black text-2xl">{data.filter((task) => task.leadId).length}</p>
        </div>
      </div>

      <div className="bg-[#1A233B] border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#F9E795] animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-10">لا توجد مهام لهذا الحساب الآن.</p>
        ) : (
          <div className="space-y-4">
            {data.map((task) => (
              <div key={task.id} className="bg-[#10182C] border border-white/10 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-white font-black text-lg">{task.title}</h2>
                    <p className="text-white/45 text-sm mt-1">
                      {task.taskType} {task.area ? `· ${task.area}` : ""} {task.dueAt ? `· ${new Date(task.dueAt).toLocaleString("ar-EG")}` : ""}
                    </p>
                  </div>
                  <span className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F9E795]/10 text-[#F9E795] border border-[#F9E795]/20 w-fit">
                    {task.status}
                  </span>
                </div>

                {(task.leadName || task.leadPhone) && (
                  <div className="mt-4 text-sm text-white/75">
                    مرتبط بـ: <span className="text-white font-bold">{task.leadName ?? "—"}</span>
                    {task.leadType ? <span className="text-white/40"> · {task.leadType}</span> : null}
                    {task.leadPhone ? <span className="text-white/50" dir="ltr"> · {task.leadPhone}</span> : null}
                  </div>
                )}

                {task.notes && <p className="mt-3 text-sm text-white/55 leading-7">{task.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
