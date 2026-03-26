import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Building2, ClipboardCheck, Loader2, MapPinned, Wrench } from "lucide-react";

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
};

function useSalesWorkshops(headers: Record<string, string>) {
  const [data, setData] = React.useState<SalesWorkshop[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const base = (import.meta as any).env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/admin/employee/sales/workshops`, { headers })
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export default function EmployeeWorkshopsPage() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders().headers ?? {};
  const { data, loading } = useSalesWorkshops(headers);

  return (
    <div className="space-y-8">
      <div className="bg-[#1E2761]/60 rounded-3xl border border-white/10 p-6 md:p-8">
        <p className="text-[#F9E795] text-sm font-bold mb-2">ورش المتابعة</p>
        <h1 className="text-3xl font-black text-white mb-3">الورش المسندة لموظف المبيعات</h1>
        <p className="text-white/60 text-sm leading-7 max-w-3xl">
          هذه الصفحة تعرض فقط الورش التي يتابعها هذا الموظف، سواء كانت ورشًا جديدة أو حالات دخلت مرحلة التفاوض أو التحويل.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-white/50 text-sm">عند توزيع الورش على موظف المبيعات ستظهر هنا فقط الحالات التابعة له.</p>
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
                  <th className="py-3 text-right">آخر تواصل</th>
                  <th className="py-3 text-right">المتابعة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((workshop) => (
                  <tr key={workshop.id} className="border-b border-white/5 align-top">
                    <td className="py-4 pr-0 pl-4">
                      <p className="text-white font-bold">{workshop.name}</p>
                      <p className="text-white/45 text-xs mt-1">{workshop.area ?? "بدون منطقة"} {workshop.address ? `· ${workshop.address}` : ""}</p>
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
                    <td className="py-4 px-4 text-white/60 text-xs">{workshop.lastContactAt ? new Date(workshop.lastContactAt).toLocaleString("ar-EG") : "—"}</td>
                    <td className="py-4 px-4 text-white/60 text-xs">{workshop.nextFollowUpAt ? new Date(workshop.nextFollowUpAt).toLocaleString("ar-EG") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
