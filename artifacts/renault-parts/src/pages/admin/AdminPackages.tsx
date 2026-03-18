import React, { useState } from 'react';
import { useListAdminPackages, useUpdatePackage } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Package2, Edit2, Check, X, Loader2 } from 'lucide-react';

type EditState = {
  name: string;
  description: string;
  sellPrice: string;
  warrantyMonths: string;
};

export default function AdminPackages() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();

  const { data: packages, isLoading } = useListAdminPackages({ request: headers });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: '', description: '', sellPrice: '', warrantyMonths: '' });
  const [savingId, setSavingId] = useState<number | null>(null);

  const { mutate: updatePkg } = useUpdatePackage({
    request: headers,
    mutation: {
      onSuccess: () => {
        toast({ title: 'تم تحديث الباكدج بنجاح' });
        queryClient.invalidateQueries();
        setEditingId(null);
        setSavingId(null);
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الباكدج' });
        setSavingId(null);
      },
    },
  });

  const startEdit = (pkg: NonNullable<typeof packages>[0]) => {
    setEditingId(pkg.id);
    setEditState({
      name: pkg.name,
      description: pkg.description,
      sellPrice: String(pkg.sellPrice),
      warrantyMonths: String(pkg.warrantyMonths),
    });
  };

  const cancelEdit = () => { setEditingId(null); setSavingId(null); };

  const saveEdit = (id: number) => {
    setSavingId(id);
    updatePkg({
      id,
      data: {
        name: editState.name,
        description: editState.description,
        sellPrice: parseFloat(editState.sellPrice),
        warrantyMonths: parseInt(editState.warrantyMonths),
      },
    });
  };

  const KM_LABELS: Record<number, string> = {
    20000: '20,000 كم',
    40000: '40,000 كم',
    60000: '60,000 كم',
    100000: '100,000 كم',
    0: 'طوارئ',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">إدارة الباكدجات</h1>
        <p className="text-white/50 text-sm">تعديل أسعار ومحتوى باكدجات الصيانة</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {(packages ?? []).map((pkg) => {
            const isEditing = editingId === pkg.id;
            const isSaving = savingId === pkg.id;

            return (
              <div key={pkg.id} className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F9E795]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package2 className="w-5 h-5 text-[#F9E795]" />
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          value={editState.name}
                          onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
                          className="bg-white/10 text-white font-bold text-lg px-3 py-1 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 w-full"
                        />
                      ) : (
                        <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
                      )}
                      <span className="text-[#F9E795] text-xs font-bold bg-[#F9E795]/10 px-2 py-0.5 rounded-full">
                        {KM_LABELS[pkg.kmService] ?? `${pkg.kmService.toLocaleString()} كم`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => saveEdit(pkg.id)}
                          disabled={isSaving}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(pkg)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm font-bold"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="text-white/40 text-xs font-bold mb-1 block">الوصف</label>
                    {isEditing ? (
                      <textarea
                        value={editState.description}
                        onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                        rows={2}
                        className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50 resize-none"
                      />
                    ) : (
                      <p className="text-white/70 text-sm leading-relaxed">{pkg.description}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Sell Price */}
                    <div>
                      <label className="text-white/40 text-xs font-bold mb-1 block">سعر البيع (ج.م)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.sellPrice}
                          onChange={e => setEditState(s => ({ ...s, sellPrice: e.target.value }))}
                          className="w-full bg-white/10 text-[#F9E795] font-bold text-lg px-3 py-1.5 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50"
                        />
                      ) : (
                        <p className="text-[#F9E795] font-black text-xl">{pkg.sellPrice.toLocaleString()} ج.م</p>
                      )}
                    </div>

                    {/* Warranty */}
                    <div>
                      <label className="text-white/40 text-xs font-bold mb-1 block">الضمان (شهر)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState.warrantyMonths}
                          onChange={e => setEditState(s => ({ ...s, warrantyMonths: e.target.value }))}
                          className="w-full bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg border border-white/20 outline-none focus:border-[#F9E795]/50"
                        />
                      ) : (
                        <p className="text-white font-bold">{pkg.warrantyMonths} شهر</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
